// Sound for Ember Court: tiny WebAudio bleeps, synthesized on the spot —
// no audio files, no network. The context is created on the first user
// gesture; screenshot mode never gestures, so it stays silent there.

let ctx = null;
let muted = false;

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

function ensureCtx() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function beep(freq, ms, type, gain) {
  if (muted) return;
  const ac = ensureCtx();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type || 'sine';
  osc.frequency.value = freq;
  amp.gain.setValueAtTime(gain || 0.08, ac.currentTime);
  amp.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + ms / 1000);
  osc.connect(amp);
  amp.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + ms / 1000);
}

export function playFlipSound() {
  beep(520, 90, 'triangle', 0.06);
}

export function playWinRoundSound() {
  beep(660, 110, 'sine', 0.07);
  setTimeout(() => beep(880, 140, 'sine', 0.07), 90);
}

export function playLoseRoundSound() {
  beep(220, 160, 'sawtooth', 0.04);
}

export function playVictorySound() {
  [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => beep(f, 220, 'sine', 0.08), i * 130));
}

export function playDefeatSound() {
  [392, 330, 262, 196].forEach((f, i) => setTimeout(() => beep(f, 260, 'sine', 0.06), i * 150));
}
