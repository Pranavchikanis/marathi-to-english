require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: students } = await supabase.from('students').select('*');
  console.log('Students:', students.map(s => s.display_name));
  
  const testStudent = students.find(s => s.display_name === 'Test User');
  if (testStudent) {
    await supabase.from('students').update({ trial_credits: 0 }).eq('id', testStudent.id);
    console.log('Set credits to 0 for Test User');
  } else {
    console.log('Test User not found!');
  }
}
run();
