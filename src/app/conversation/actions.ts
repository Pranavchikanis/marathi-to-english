'use server';

import { generateConversationReply } from '@/lib/ai/groq';
import { createClient } from '@/lib/supabase/server';

export type ConversationMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
};

export async function processConversationTurn(
  history: ConversationMessage[],
  newMessage: string
): Promise<{ text: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Keep only the last 10 messages for context to save tokens and stay relevant
  const recentHistory = history.slice(-10);

  const formattedMessages: { role: 'user' | 'assistant'; content: string }[] = recentHistory.map(msg => ({
    role: msg.role,
    content: msg.content
  }));

  formattedMessages.push({ role: 'user', content: newMessage });

  try {
    const reply = await generateConversationReply(formattedMessages);
    return { text: reply };
  } catch (error) {
    console.error('Error in conversation turn:', error);
    throw new Error('Failed to process conversation turn');
  }
}
