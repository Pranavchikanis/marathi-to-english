'use server';

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Database } from '@/types/database.types';

export async function login(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.set(name, '', options);
        },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return redirect('/login?error=Invalid credentials');
  }

  return redirect('/dashboard');
}

export async function autoLogin() {
  const email = 'student@tejaswini.app';
  const password = 'tejaswini-student-pass123';

  const cookieStore = await cookies();
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value; },
        set(name: string, value: string, options: any) { cookieStore.set(name, value, options); },
        remove(name: string, options: any) { cookieStore.set(name, '', options); },
      },
    }
  );

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      return redirect(`/login?error=${signUpError.message}`);
    }
  }

  // Ensure DB is initialized for this student
  const { data: authUser } = await supabase.auth.getUser();
  if (authUser?.user) {
    const adminClient = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { get() { return ''; }, set() {}, remove() {} } }
    );

    const { data: student } = await adminClient.from('students').select('id').eq('auth_user_id', authUser.user.id).single();
    
    if (!student) {
      let { data: stage } = await adminClient.from('curriculum_stages').select('id').eq('level_number', 1).single();
      
      if (!stage) {
        const stageRes = await adminClient.from('curriculum_stages').insert({ level_number: 1, name: 'Beginner' }).select().single();
        stage = stageRes.data as { id: string };
        
        const conceptRes = await adminClient.from('concepts').insert({ stage_id: stage.id, name: 'Greetings' }).select().single();
        const concept = conceptRes.data as { id: string };
        
        await adminClient.from('exercises').insert([
          { concept_id: concept.id, marathi_prompt: 'शुभ प्रभात', reference_translations: ['Good morning'], difficulty_level: 1 },
          { concept_id: concept.id, marathi_prompt: 'तू कसा आहेस?', reference_translations: ['How are you?'], difficulty_level: 1 },
          { concept_id: concept.id, marathi_prompt: 'माझे नाव प्रणव आहे', reference_translations: ['My name is Pranav'], difficulty_level: 2 },
        ]);
      }
      
      await adminClient.from('students').insert({
        auth_user_id: authUser.user.id,
        display_name: 'Student',
        current_stage_id: stage.id
      });
    }
  }

  return redirect('/dashboard');
}
