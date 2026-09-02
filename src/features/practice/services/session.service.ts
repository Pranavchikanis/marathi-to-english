/* eslint-disable @typescript-eslint/no-explicit-any */
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

export class SessionService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  /**
   * Initializes a new practice session for a student.
   */
  async initializeSession(studentId: string) {
    // 1. Create the session
    const { data: session, error } = await (this.supabase.from('sessions') as any)
      .insert({
        student_id: studentId,
        status: 'IN_PROGRESS',
        xp_earned: 0,
      })
      .select()
      .single()

    if (error) throw new Error(`Failed to initialize session: ${error.message}`)

    // 2. Generate exercises using curriculum engine
    const { CurriculumService } = await import('@/features/curriculum/services/curriculum.service');
    const curriculumService = new CurriculumService();
    const selectedExercises = await curriculumService.generateSessionExercises(studentId, this.supabase);

    // 3. Bulk insert session exercises
    if (selectedExercises.length > 0) {
      const sessionExercisesData = selectedExercises.map((ex, index) => ({
        session_id: session.id,
        exercise_id: ex.exercise_id,
        order_index: index,
        status: 'PENDING',
      }));

      const { error: insertError } = await (this.supabase.from('session_exercises') as any)
        .insert(sessionExercisesData);

      if (insertError) {
        console.error('Error inserting session exercises:', insertError);
        throw new Error(`Failed to generate session exercises: ${insertError.message}`);
      }
    }

    return session;
  }

  /**
   * Fetches the next pending exercise for the given session.
   */
  async getNextExercise(sessionId: string) {
    const { data: sessionExercise, error } = await this.supabase
      .from('session_exercises')
      .select('*, exercises(*)')
      .eq('session_id', sessionId)
      .eq('status', 'PENDING')
      .order('order_index', { ascending: true })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 means no rows found, which means session is complete
      throw new Error(`Failed to fetch next exercise: ${error.message}`)
    }

    return sessionExercise || null
  }

  /**
   * Marks a session as completed and computes final summary.
   * Performs XP aggregation, Streak calculation, and Mastery updates.
   */
  async completeSession(sessionId: string) {
    // 1. Fetch the session and student context
    const { data: session, error: sessionError } = await (this.supabase
      .from('sessions') as any)
      .select('*, students(*)')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) throw new Error(`Failed to fetch session: ${sessionError?.message}`)
    if (session.status === 'COMPLETED') {
      return { xp_earned: session.xp_earned, message: 'Already completed' }; // Idempotency
    }

    const student = (session.students as any);

    // 2. Fetch all attempts and evaluations for this session
    const { data: attemptsData, error: attemptsError } = await (this.supabase
      .from('session_exercises') as any)
      .select(`
        id,
        exercises(concept_id),
        attempts(
          id,
          evaluations(grade)
        )
      `)
      .eq('session_id', sessionId)

    if (attemptsError) throw new Error(`Failed to fetch session attempts: ${attemptsError.message}`)

    // 3. Import Progress Services
    const { ProgressService } = await import('@/features/progress/services/progress.service');
    const { MasteryService } = await import('@/features/progress/services/mastery.service');
    const { AdaptiveEngineService } = await import('@/features/progress/services/adaptive-engine.service');

    let sessionXP = 0;
    const conceptGrades: Record<string, string[]> = {};

    // 4. Calculate XP and aggregate grades per concept
    (attemptsData || []).forEach((se: any) => {
      const attempts = se.attempts || [];
      const conceptId = se.exercises?.concept_id;

      attempts.forEach((attempt: any) => {
        const evaluation = attempt.evaluations;
        if (evaluation && evaluation.grade) {
          const grade = evaluation.grade;
          sessionXP += ProgressService.calculateAttemptXp(grade);
          
          if (conceptId) {
            if (!conceptGrades[conceptId]) conceptGrades[conceptId] = [];
            conceptGrades[conceptId].push(grade);
          }
        }
      });
    });

    // Cap Session XP to theoretical maximums (e.g. 15 questions * 10 XP = 150 + buffer)
    if (sessionXP > 200) sessionXP = 200;

    // 5. Calculate New Streak
    const nowIso = new Date().toISOString();
    const newStreak = ProgressService.calculateStreak(
      student.last_practiced_at,
      student.current_streak || 0,
      nowIso
    );

    // 6. Process Mastery Updates
    const masteryUpdates: any[] = [];
    const allConceptIds = Object.keys(conceptGrades);
    
    if (allConceptIds.length > 0) {
      // Fetch current mastery for these concepts
      const { data: existingMastery } = await (this.supabase
        .from('mastery') as any)
        .select('*')
        .eq('student_id', session.student_id)
        .in('concept_id', allConceptIds);

      const masteryMap = new Map<string, any>((existingMastery || []).map((m: any) => [m.concept_id, m]));

      for (const conceptId of allConceptIds) {
        let profile: any = masteryMap.get(conceptId);
        if (!profile) {
          profile = {
            student_id: session.student_id,
            concept_id: conceptId,
            status: 'INTRODUCED',
            correct_attempts: 0,
            incorrect_attempts: 0,
            last_practiced_at: null,
          };
        }

        const grades = conceptGrades[conceptId];
        
        let recentCorrect = 0;
        let recentIncorrect = 0;

        grades.forEach((grade) => {
          const updated = MasteryService.processAttemptEvidence(grade as any, {
            conceptId: profile.concept_id,
            status: profile.status,
            correctAttempts: profile.correct_attempts,
            incorrectAttempts: profile.incorrect_attempts
          });
          profile.correct_attempts = updated.correctAttempts;
          profile.incorrect_attempts = updated.incorrectAttempts;
          
          if (grade === 'A' || grade === 'B') {
            recentCorrect++;
            recentIncorrect = 0;
          } else if (grade !== 'F') {
            recentIncorrect++;
            recentCorrect = 0;
          }
        });

        const daysSince = profile.last_practiced_at 
          ? Math.floor((new Date().getTime() - new Date(profile.last_practiced_at).getTime()) / (1000 * 3600 * 24))
          : 0;

        const newStatus = MasteryService.evaluateStateTransitions(
          {
             conceptId: profile.concept_id,
             status: profile.status,
             correctAttempts: profile.correct_attempts,
             incorrectAttempts: profile.incorrect_attempts
          },
          recentCorrect,
          recentIncorrect,
          daysSince
        );

        profile.status = newStatus;
        profile.last_practiced_at = nowIso;
        masteryUpdates.push(profile);
      }
    }

    // 7. Check Stage Progression
    let nextStageId = student.current_stage_id;
    if (student.current_stage_id) {
      const { data: stageConcepts } = await (this.supabase
        .from('concepts') as any)
        .select('id')
        .eq('stage_id', student.current_stage_id);
        
      if (stageConcepts && stageConcepts.length > 0) {
        const conceptIds = stageConcepts.map((c: any) => c.id);
        const { data: stageMastery } = await (this.supabase
          .from('mastery') as any)
          .select('*')
          .eq('student_id', session.student_id)
          .in('concept_id', conceptIds);
          
        // Combine with updates from this session
        const combinedProfiles = (stageConcepts || []).map((c: any) => {
           const update = masteryUpdates.find(m => m.concept_id === c.id);
           if (update) return { status: update.status };
           const existing = (stageMastery || []).find((m: any) => m.concept_id === c.id);
           return { status: existing ? existing.status : 'INTRODUCED' };
        });

        if (AdaptiveEngineService.checkProgression(combinedProfiles as any)) {
           // We are currently at Stage 1, for MVP demo we won't automatically progress stages yet
           // because Stage 2 doesn't exist and we can't do math on UUIDs.
           nextStageId = student.current_stage_id; 
        }
      }
    }

    // 8. Execute Sequential Updates (Transaction alternative via Service Role)
    
    // 8.a Complete Session
    const { data: updatedSession, error: completeError } = await (this.supabase
      .from('sessions') as any)
      .update({
        status: 'COMPLETED',
        completed_at: nowIso,
        xp_earned: sessionXP,
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (completeError) throw new Error(`Failed to complete session: ${completeError.message}`)

    // 8.b Update Student Profile
    const { error: studentUpdateError } = await (this.supabase
      .from('students') as any)
      .update({
        total_xp: (student.total_xp || 0) + sessionXP,
        current_streak: newStreak,
        last_practiced_at: nowIso,
        current_stage_id: nextStageId
      })
      .eq('id', session.student_id)

    if (studentUpdateError) throw new Error(`Failed to update student progress: ${studentUpdateError.message}`)

    // 8.c Upsert Mastery
    let upgradesCount = 0;
    if (masteryUpdates.length > 0) {
      const { error: masteryError } = await (this.supabase
        .from('mastery') as any)
        .upsert(masteryUpdates, { onConflict: 'student_id, concept_id' });
        
      if (masteryError) throw new Error(`Failed to update mastery: ${masteryError.message}`)
      
      // Calculate how many actually upgraded
      masteryUpdates.forEach(update => {
        const oldProfile = masteryMap.get(update.concept_id);
        if (oldProfile && oldProfile.status !== update.status) {
          // If status changed and it's not a downgrade, count it as an upgrade
          const statusOrder = ['INTRODUCED', 'LEARNING', 'PRACTICING', 'MASTERED'];
          if (statusOrder.indexOf(update.status) > statusOrder.indexOf(oldProfile.status)) {
            upgradesCount++;
          }
        } else if (!oldProfile && update.status !== 'INTRODUCED') {
          // Edge case: new concept immediately promoted
          upgradesCount++;
        }
      });
    }

    return {
      ...updatedSession,
      mastery_upgrades: upgradesCount,
      total_exercises: attemptsData ? attemptsData.length : 0
    }
  }
}

