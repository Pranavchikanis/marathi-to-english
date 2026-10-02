require('dotenv').config({path: '.env.local'});
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  while(true) {
    const { data: students } = await supabase.from('students').select('*');
    const testStudent = students.find(s => s.display_name === 'Test3 User');
    if (testStudent && testStudent.trial_credits > 0) {
      await supabase.from('students').update({ trial_credits: 0 }).eq('id', testStudent.id);
      console.log('Set credits to 0 for Test3 User');
      process.exit(0);
    }
    await new Promise(r => setTimeout(r, 2000));
  }
}
run();
