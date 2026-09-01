const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://gzaqxegswbuqtckdzaph.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6YXF4ZWdzd2J1cXRja2R6YXBoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE5NDk1NiwiZXhwIjoyMTAzNzcwOTU2fQ.-RfDjNvg-1HWJf45W0OSazuXMY2SiuHcz-UGdiTo6Xs';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function seed() {
  console.log('Starting seed process...');
  
  // 1. Get all users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
  if (usersError) {
    console.error('Error fetching users:', usersError);
    return;
  }
  
  if (!users || users.length === 0) {
    console.log('No users found in auth.users! Cannot create student profile.');
    return;
  }
  
  console.log(`Found ${users.length} users. Will create profiles for all.`);
  
  // 2. Insert Stage
  let { data: stage } = await supabase.from('curriculum_stages').select('id').eq('level_number', 1).single();
  if (!stage) {
    console.log('Inserting curriculum stage...');
    const stageRes = await supabase.from('curriculum_stages').insert({ level_number: 1, name: 'Beginner' }).select().single();
    if (stageRes.error) {
      console.error('Error inserting stage:', stageRes.error);
      return;
    }
    stage = stageRes.data;
  } else {
    console.log('Stage already exists.');
  }

  // 3. Insert Concept
  let { data: concept } = await supabase.from('concepts').select('id').eq('name', 'Greetings').single();
  if (!concept) {
    console.log('Inserting concept...');
    const conceptRes = await supabase.from('concepts').insert({ stage_id: stage.id, name: 'Greetings' }).select().single();
    if (conceptRes.error) {
      console.error('Error inserting concept:', conceptRes.error);
      return;
    }
    concept = conceptRes.data;
  } else {
    console.log('Concept already exists.');
  }

  // 4. Insert Exercises
  const { data: exercises } = await supabase.from('exercises').select('id');
  if (!exercises || exercises.length === 0) {
    console.log('Inserting exercises...');
    const exRes = await supabase.from('exercises').insert([
      { concept_id: concept.id, marathi_prompt: 'शुभ प्रभात', reference_translations: ['Good morning'], difficulty_level: 1 },
      { concept_id: concept.id, marathi_prompt: 'तू कसा आहेस?', reference_translations: ['How are you?'], difficulty_level: 1 },
      { concept_id: concept.id, marathi_prompt: 'माझे नाव प्रणव आहे', reference_translations: ['My name is Pranav'], difficulty_level: 2 },
    ]);
    if (exRes.error) {
      console.error('Error inserting exercises:', exRes.error);
    }
  } else {
    console.log('Exercises already exist.');
  }

  // 5. Insert Student Profiles
  for (const user of users) {
    const { data: student } = await supabase.from('students').select('id').eq('auth_user_id', user.id).single();
    if (!student) {
      console.log(`Inserting student profile for user: ${user.email}`);
      const profileRes = await supabase.from('students').insert({
        auth_user_id: user.id,
        display_name: user.email.split('@')[0],
        current_stage_id: stage.id
      });
      if (profileRes.error) {
         console.error(`Error inserting student profile for ${user.email}:`, profileRes.error);
      }
    } else {
      console.log(`Student profile already exists for user: ${user.email}`);
    }
  }
  
  console.log('Seed process completed.');
}

seed();
