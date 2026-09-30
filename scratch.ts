import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function wipeUsers() {
  console.log("Fetching users...");
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  
  if (error) {
    console.error("Error fetching users:", error);
    return;
  }
  
  console.log(`Found ${users.length} users. Deleting...`);
  
  for (const u of users) {
    const { error: delError } = await supabase.auth.admin.deleteUser(u.id);
    if (delError) {
      console.error(`Failed to delete ${u.id}:`, delError);
    } else {
      console.log(`Deleted user ${u.id}`);
    }
  }
  
  console.log("All users wiped successfully.");
}

wipeUsers();
