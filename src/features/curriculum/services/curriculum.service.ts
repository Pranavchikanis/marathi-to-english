/* eslint-disable @typescript-eslint/no-explicit-any */
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

export type SessionPhase = 'WARMUP' | 'CORE' | 'VOICE' | 'REVIEW';

export interface DailyPlanItem {
  phase: SessionPhase;
  conceptId?: string;
}

export class CurriculumService {
  /**
   * Generates a deterministic daily session plan based on REQ-C-05.
   */
  static getDailyPlanTemplate(): DailyPlanItem[] {
    return [
      { phase: 'WARMUP' },
      { phase: 'WARMUP' },
      { phase: 'CORE' },
      { phase: 'CORE' },
      { phase: 'CORE' },
      { phase: 'CORE' },
      { phase: 'CORE' },
      { phase: 'VOICE' },
      { phase: 'VOICE' },
      { phase: 'REVIEW' }
    ];
  }

  /**
   * Generates exercises for a new session based on student's mastery.
   */
  async generateSessionExercises(
    studentId: string,
    supabase: SupabaseClient<Database>
  ): Promise<{ exercise_id: string }[]> {
    // 1. Fetch mastery
    const { data: mastery } = await supabase
      .from('mastery')
      .select('concept_id, status')
      .eq('student_id', studentId);

    const masteryList: any[] = mastery || [];
    
    // Group concepts by bucket
    const warmupConcepts = masteryList.filter(m => m.status === 'PROFICIENT').map(m => m.concept_id);
    const coreConcepts = masteryList.filter(m => m.status === 'INTRODUCED' || m.status === 'DEVELOPING' || m.status === 'PRACTICING').map(m => m.concept_id);
    const reviewConcepts = masteryList.filter(m => m.status === 'NEEDS_REVIEW').map(m => m.concept_id);

    // If student is out of core concepts, let AI generate the next topic
    if (coreConcepts.length === 0) {
      try {
        const { generateNextCurriculumTopic } = await import('@/lib/ai/gemini');
        
        // 1. Fetch all concepts the student has ever seen from their mastery profile
        const { data: allSeenConcepts } = await (supabase.from('mastery') as any)
          .select('concepts(name)')
          .eq('student_id', studentId);
        
        const learnedTopics = (allSeenConcepts || []).map((m: any) => m.concepts?.name).filter(Boolean);
        
        // 2. Ask AI to generate next topic
        const newTopic = await generateNextCurriculumTopic(learnedTopics);
        
        // 3. Find the student's current stage to attach it to
        const { data: student } = await (supabase.from('students') as any)
          .select('current_stage_id')
          .eq('id', studentId)
          .single();
          
        if (student?.current_stage_id) {
          // 4. Insert into database
          const { data: insertedConcept } = await (supabase.from('concepts') as any)
            .insert({ stage_id: student.current_stage_id, name: newTopic.name, description: newTopic.description })
            .select('id')
            .single();
            
          if (insertedConcept?.id) {
            coreConcepts.push(insertedConcept.id);
            // Initialize mastery for this new concept
            await (supabase.from('mastery') as any).insert({
              student_id: studentId,
              concept_id: insertedConcept.id,
              status: 'INTRODUCED'
            });
          }
        }
      } catch (e) {
        console.error("Failed to dynamically generate next concept:", e);
      }
    }

    // 2. Map plan to actual concepts
    const plan = CurriculumService.getDailyPlanTemplate();
    const targetConceptIds: string[] = [];

    const pickRandom = (arr: string[]) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

    for (const item of plan) {
      let conceptId: string | null = null;
      if (item.phase === 'WARMUP') {
        // Prioritize NEEDS_REVIEW for warmup slots
        conceptId = pickRandom(reviewConcepts) || pickRandom(warmupConcepts) || pickRandom(coreConcepts);
      } else if (item.phase === 'CORE') {
        conceptId = pickRandom(coreConcepts);
      } else if (item.phase === 'VOICE') {
        conceptId = pickRandom(coreConcepts) || pickRandom(warmupConcepts);
      } else if (item.phase === 'REVIEW') {
        conceptId = pickRandom(reviewConcepts) || pickRandom(coreConcepts);
      }

      if (conceptId) {
        targetConceptIds.push(conceptId);
      }
    }

    // 3. Fetch recently used exercises to prevent duplicates
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 3600 * 1000).toISOString();
    const { data: recentAttempts } = await (supabase.from('attempts') as any)
      .select('session_exercises!inner(exercise_id, sessions!inner(student_id))')
      .eq('session_exercises.sessions.student_id', studentId)
      .gte('created_at', fortyEightHoursAgo);
      
    const excludedIds = (recentAttempts || [])
      .map((a: any) => a.session_exercises?.exercise_id)
      .filter(Boolean);

    // 4. Fetch exercises for the selected concepts with adaptive difficulty targeting
    const { AdaptiveEngineService } = await import('@/features/progress/services/adaptive-engine.service');
    const selectedExercises: { exercise_id: string }[] = [];
    
    for (const conceptId of targetConceptIds) {
      const targetDifficulty = await AdaptiveEngineService.calculateConceptDifficulty(studentId, conceptId, supabase);
      
      let query = (supabase.from('exercises') as any)
        .select('id, difficulty_level')
        .eq('concept_id', conceptId);
        
      if (excludedIds.length > 0) {
        // Exclude recently used if possible
        query = query.not('id', 'in', `(${excludedIds.join(',')})`);
      }
      
      const { data: exercises } = await query.limit(50);
        
      let selectedId: string | null = null;

      if (exercises && (exercises as any[]).length > 0) {
        // Sort by closest difficulty to target
        const sorted = (exercises as any[]).sort((a, b) => {
          const diffA = Math.abs((a.difficulty_level || 1) - targetDifficulty);
          const diffB = Math.abs((b.difficulty_level || 1) - targetDifficulty);
          if (diffA === diffB) return Math.random() - 0.5; // Randomize ties
          return diffA - diffB;
        });
        selectedId = sorted[0].id;
      } else if (excludedIds.length > 0) {
        // Fallback: If no exercises found (because they were all excluded), retry without exclusion
        const { data: fallbackExercises } = await (supabase.from('exercises') as any)
          .select('id, difficulty_level')
          .eq('concept_id', conceptId)
          .limit(50);
          
        if (fallbackExercises && (fallbackExercises as any[]).length > 0) {
          const sorted = (fallbackExercises as any[]).sort((a, b) => {
            const diffA = Math.abs((a.difficulty_level || 1) - targetDifficulty);
            const diffB = Math.abs((b.difficulty_level || 1) - targetDifficulty);
            if (diffA === diffB) return Math.random() - 0.5; // Randomize ties
            return diffA - diffB;
          });
          selectedId = sorted[0].id;
        }
      }

      // INFINITE GENERATION FALLBACK
      if (!selectedId) {
        const { data: conceptData } = await supabase.from('concepts').select('name').eq('id', conceptId).single();
        if (conceptData) {
          try {
            const { generateInfiniteExercises } = await import('@/lib/ai/gemini');
            const aiExercises = await generateInfiniteExercises((conceptData as any).name, 5);
            
            // Insert them into the DB
            const { data: inserted } = await (supabase.from('exercises') as any)
              .insert(aiExercises.map((ex: any) => ({
                concept_id: conceptId,
                marathi_prompt: ex.marathi_prompt,
                reference_translations: ex.reference_translations,
                difficulty_level: ex.difficulty_level || 1
              })))
              .select('id, difficulty_level');
              
            if (inserted && inserted.length > 0) {
              // Find the best match from the newly generated ones
              const sorted = (inserted as any[]).sort((a, b) => {
                const diffA = Math.abs((a.difficulty_level || 1) - targetDifficulty);
                const diffB = Math.abs((b.difficulty_level || 1) - targetDifficulty);
                return diffA - diffB;
              });
              selectedId = sorted[0].id;
            }
          } catch (e) {
            console.error('Failed to generate infinite exercises:', e);
          }
        }
      }

      if (selectedId) {
        selectedExercises.push({ exercise_id: selectedId });
        excludedIds.push(selectedId);
      }
    }

    return selectedExercises;
  }
}
