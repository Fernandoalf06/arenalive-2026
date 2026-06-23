let isEnabled = false;
let synth = window.speechSynthesis;

export function initSpeech() {
  // Try to load voices early
  if (synth) {
    synth.getVoices();
  }
}

export function toggleSpeech() {
  isEnabled = !isEnabled;
  if (!isEnabled && synth) {
    synth.cancel();
  }
  return isEnabled;
}

export function speak(text) {
  if (!isEnabled || !synth) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1.1;
  utterance.pitch = 1.0;

  // Prefer natural English voices
  const voices = synth.getVoices();
  const enVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Google'));
  if (enVoice) {
    utterance.voice = enVoice;
  }

  synth.speak(utterance);
}
