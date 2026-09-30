'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Loader2, ArrowLeft, Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSpeech } from '@/lib/speech/recognition';
import { usePlayback } from '@/lib/speech/synthesis';
import { processConversationTurn, ConversationMessage } from './actions';
import Link from 'next/link';

export default function ConversationPage() {
  const [messages, setMessages] = useState<ConversationMessage[]>([
    {
      id: 'init',
      role: 'assistant',
      content: 'Hello! I am ready to chat. What would you like to talk about today?',
      timestamp: Date.now(),
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { state: speechState, transcript, startRecording, stopRecording, reset: resetSpeech } = useSpeech('en-IN'); // Try to recognize English mostly, but works okay for mixing
  const { playAudio, isPlaying, stopAudio } = usePlayback();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, transcript, isProcessing]);

  // Initial greeting
  useEffect(() => {
    playAudio(messages[0].content);
    return () => stopAudio();
  }, [playAudio, stopAudio, messages]);

  // Handle when user stops speaking
  useEffect(() => {
    if (speechState === 'IDLE' && transcript.trim() !== '' && !isProcessing) {
      handleUserSubmit(transcript.trim());
      resetSpeech();
    }
  }, [speechState, transcript, isProcessing, resetSpeech]);

  const handleUserSubmit = async (text: string) => {
    setIsProcessing(true);
    stopAudio(); // Stop any current AI speech if user interrupts

    const newUserMsg: ConversationMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    
    setMessages(prev => [...prev, newUserMsg]);

    try {
      const response = await processConversationTurn(messages, text);
      
      const newAssistantMsg: ConversationMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.text,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, newAssistantMsg]);
      playAudio(response.text);
      
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I couldn't understand that. Could you try saying it again?",
        timestamp: Date.now(),
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const isListening = speechState === 'RECORDING';
  const showPulse = isListening || isPlaying || isProcessing;

  return (
    <div className="flex flex-col min-h-screen bg-surface-default">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border-default bg-surface-default/80 backdrop-blur-md px-4 py-4 flex items-center shadow-sm">
        <Link href="/dashboard" className="text-text-secondary hover:text-text-primary transition-colors p-2 -ml-2 rounded-full hover:bg-surface-elevated">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="ml-2 text-lg font-semibold text-text-primary">Voice Conversation</h1>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 pb-40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-base shadow-sm ${
                msg.role === 'user'
                  ? 'bg-interactive-default text-text-inverse rounded-br-sm'
                  : 'bg-surface-elevated text-text-primary border border-border-default rounded-bl-sm'
              }`}
            >
              {msg.role === 'assistant' && (
                <Volume2 className="w-4 h-4 mb-2 opacity-50 inline-block mr-2" />
              )}
              {msg.content}
            </div>
          </div>
        ))}

        {/* Live Transcript Bubble */}
        {(transcript || isProcessing) && (
          <div className="flex w-full justify-end">
            <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-base shadow-sm bg-interactive-default/20 text-text-primary border border-interactive-default/30 rounded-br-sm flex items-center gap-3">
              {transcript || <span className="opacity-50 italic">Thinking...</span>}
              {isProcessing && <Loader2 className="w-4 h-4 animate-spin text-interactive-default" />}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Control Area - Siri Style Orb */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-surface-default via-surface-default to-transparent flex flex-col items-center justify-end pointer-events-none">
        
        <div className="text-sm font-medium text-text-secondary mb-6 h-6 pointer-events-auto">
          {isProcessing ? 'Thinking...' : isListening ? 'Listening... (Tap to stop)' : isPlaying ? 'Speaking...' : 'Tap to speak'}
        </div>

        <div className="relative pointer-events-auto">
          {/* Pulsing rings */}
          {showPulse && (
            <>
              <div className="absolute inset-0 rounded-full bg-interactive-default/20 animate-ping" style={{ animationDuration: '2s' }}></div>
              <div className="absolute inset-[-20px] rounded-full bg-interactive-default/10 animate-pulse" style={{ animationDuration: '1.5s' }}></div>
            </>
          )}
          
          <Button
            size="lg"
            variant={isListening ? "secondary" : "default"}
            className={`relative z-10 w-20 h-20 rounded-full shadow-2xl transition-all duration-300 ${
              isListening ? 'scale-110 shadow-status-error/40' : 'hover:scale-105'
            }`}
            onClick={() => {
              if (isListening) {
                stopRecording();
              } else {
                startRecording();
              }
            }}
            disabled={isProcessing}
            style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none', touchAction: 'none', userSelect: 'none' }}
          >
            {isListening ? (
              <Mic className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
