const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = 'https://gzaqxegswbuqtckdzaph.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6YXF4ZWdzd2J1cXRja2R6YXBoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE5NDk1NiwiZXhwIjoyMTAzNzcwOTU2fQ.-RfDjNvg-1HWJf45W0OSazuXMY2SiuHcz-UGdiTo6Xs';
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function testComplete() {
  console.log('Fetching active session...');
  const { data: session } = await supabase.from('sessions').select('*').eq('status', 'IN_PROGRESS').limit(1).single();
  if (!session) {
    console.log('No active session found to test.');
    return;
  }
  
  console.log('Found session:', session.id);
  const sessionId = session.id;

  // Let's copy the EXACT logic of completeSession
  const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('*, students(*)')
      .eq('id', sessionId)
      .single();

  if (sessionError) { console.error('sessionError:', sessionError); return; }

  const student = sessionData.students;

  const { data: attemptsData, error: attemptsError } = await supabase
      .from('session_exercises')
      .select(`id, exercises(concept_id), attempts(id, evaluations(grade))`)
      .eq('session_id', sessionId);

  if (attemptsError) { console.error('attemptsError:', attemptsError); return; }

  let sessionXP = 50;
  let newStreak = 1;
  const nowIso = new Date().toISOString();
  let nextStageId = student.current_stage_id;

  // Test the 3 updates
  
  console.log('Testing 8.a Update Session');
  const { error: completeError } = await supabase
      .from('sessions')
      .update({
        status: 'COMPLETED',
        completed_at: nowIso,
        xp_earned: sessionXP,
      })
      .eq('id', sessionId);
  if (completeError) { console.error('completeError:', completeError); return; }

  console.log('Testing 8.b Update Student Profile');
  const { error: studentUpdateError } = await supabase
      .from('students')
      .update({
        total_xp: (student.total_xp || 0) + sessionXP,
        current_streak: newStreak,
        last_practiced_at: nowIso,
        current_stage_id: nextStageId
      })
      .eq('id', sessionData.student_id);
  if (studentUpdateError) { console.error('studentUpdateError:', studentUpdateError); return; }

  console.log('Testing 8.c Upsert Mastery');
  const conceptId = attemptsData && attemptsData[0] && attemptsData[0].exercises ? attemptsData[0].exercises.concept_id : null;
  if (conceptId) {
      const masteryUpdates = [{
          student_id: sessionData.student_id,
          concept_id: conceptId,
          status: 'INTRODUCED',
          correct_attempts: 1,
          incorrect_attempts: 0,
          last_practiced_at: nowIso
      }];
      const { error: masteryError } = await supabase
        .from('mastery')
        .upsert(masteryUpdates, { onConflict: 'student_id, concept_id' });
      if (masteryError) { console.error('masteryError:', masteryError); return; }
  }

  console.log('All DB operations succeeded!');
}

testComplete();
