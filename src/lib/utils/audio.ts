// Simple Web Audio API synthesizer for gamification sounds

let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

export function playSuccessSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'sine';
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Quick ding
  osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
  osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // Up to A6

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.5);
}

export function playErrorSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = 'triangle';
  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  // Gentle low boop
  osc.frequency.setValueAtTime(300, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);

  gainNode.gain.setValueAtTime(0, ctx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
}

export function playCompletionSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const osc1 = ctx.createOscillator();
  const osc2 = ctx.createOscillator();
  const osc3 = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc1.connect(gainNode);
  osc2.connect(gainNode);
  osc3.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc1.type = 'sine';
  osc2.type = 'sine';
  osc3.type = 'triangle';

  // Major chord arpeggio
  const t = ctx.currentTime;
  
  osc1.frequency.setValueAtTime(523.25, t); // C5
  osc2.frequency.setValueAtTime(659.25, t + 0.1); // E5
  osc3.frequency.setValueAtTime(783.99, t + 0.2); // G5

  gainNode.gain.setValueAtTime(0, t);
  gainNode.gain.linearRampToValueAtTime(0.3, t + 0.1);
  gainNode.gain.setValueAtTime(0.3, t + 0.3);
  gainNode.gain.exponentialRampToValueAtTime(0.01, t + 1.0);

  osc1.start(t);
  osc2.start(t + 0.1);
  osc3.start(t + 0.2);
  
  osc1.stop(t + 1.0);
  osc2.stop(t + 1.0);
  osc3.stop(t + 1.0);
}
