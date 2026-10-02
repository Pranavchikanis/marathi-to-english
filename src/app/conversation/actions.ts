'use server';

import { generateConversationReply } from '@/lib/ai/groq';
import { createClient } from '@/lib/supabase/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

export type ConversationMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  audio_text?: string;
  timestamp: number;
};

export async function processConversationTurn(
  history: ConversationMessage[],
  newMessage: string
): Promise<{ text: string, audio_text: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const serviceClient = await createClient(); 
  
  const supabaseService = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: student } = await supabaseService
    .from('students')
    .select('id, trial_credits')
    .eq('auth_user_id', user.id)
    .single();

  if (!student) throw new Error("Student not found");
  if (student.trial_credits <= 0) {
    throw new Error("TRIAL_EXPIRED: Your free trial has expired. Please contact support to upgrade your plan.");
  }

  // Deduct 1 credit
  await supabaseService.from('students').update({ trial_credits: student.trial_credits - 1 }).eq('id', student.id);

  // Keep only the last 10 messages for context to save tokens and stay relevant
  const recentHistory = history.slice(-10);

  const formattedMessages: { role: 'user' | 'assistant'; content: string }[] = recentHistory.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  formattedMessages.push({ role: 'user', content: newMessage });

  try {
    const replyString = await generateConversationReply(formattedMessages);
    
    // Safely extract JSON in case the model wraps it in markdown backticks
    let jsonToParse = replyString;
    const jsonMatch = replyString.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonToParse = jsonMatch[0];
    }

    try {
      const parsed = JSON.parse(jsonToParse);
      return { 
        text: parsed.text || replyString, 
        audio_text: parsed.audio_text || parsed.text || replyString 
      };
    } catch (e) {
      return { text: replyString, audio_text: replyString };
    }
  } catch (error) {
    console.error('Error in conversation turn:', error);
    throw new Error('Failed to process conversation turn');
  }
}
