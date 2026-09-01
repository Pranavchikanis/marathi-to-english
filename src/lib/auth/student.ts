import { createClient, createServiceClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

export async function ensureStudentProfile(userId: string) {
  const serviceClient = createServiceClient(); // use service client to bypass RLS for inserts
  
  const { data: student } = await (serviceClient.from('students') as any)
    .select('id, display_name, total_xp, current_streak')
    .eq('auth_user_id', userId)
    .single();
    
  if (student) {
    return student;
  }
  
  // Create if missing
  let { data: stage } = await (serviceClient.from('curriculum_stages') as any)
    .select('id')
    .eq('level_number', 1)
    .single();
    
  if (!stage) {
    // Fallback if no stage 1 exists
    const { data: newStage } = await (serviceClient.from('curriculum_stages') as any)
      .insert({ level_number: 1, name: 'Beginner' })
      .select('id')
      .single();
    stage = newStage;
  }
  
  if (stage) {
    const { data: newStudent, error: insertError } = await (serviceClient.from('students') as any)
      .insert({
        auth_user_id: userId,
        display_name: 'Student',
        current_stage_id: stage.id
      })
      .select('id, display_name, total_xp, current_streak')
      .single();
      
    if (insertError) {
      console.error("Failed to insert student:", insertError);
    }
      
    return newStudent;
  }
  
  return null;
}
