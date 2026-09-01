import { createClient } from '@supabase/supabase-js';
import { SessionService } from './src/features/practice/services/session.service.js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gzaqxegswbuqtckdzaph.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd6YXF4ZWdzd2J1cXRja2R6YXBoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE5NDk1NiwiZXhwIjoyMTAzNzcwOTU2fQ.-RfDjNvg-1HWJf45W0OSazuXMY2SiuHcz-UGdiTo6Xs';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runTest() {
  const { data: session } = await supabase.from('sessions').select('*').eq('status', 'IN_PROGRESS').limit(1).single();
  
  if (!session) {
    console.log('No active session found.');
    return;
  }
  
  console.log('Testing real completeSession on:', session.id);
  const sessionService = new SessionService(supabase as any);
  
  try {
    const res = await sessionService.completeSession(session.id);
    console.log('Success:', res);
  } catch (err) {
    console.error('Crash:', err);
  }
}

runTest();
