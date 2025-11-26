/**
 * Audio utility for playing pronunciation audio
 * Supports uploaded audio files with Web Speech API fallback
 */

// Check if Web Speech API is available
export function isSpeechSynthesisAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

// Get available Japanese voices
export function getJapaneseVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisAvailable()) return [];

  return window.speechSynthesis
    .getVoices()
    .filter(voice => voice.lang.startsWith('ja') || voice.lang === 'ja-JP');
}

// Play audio from URL or use Web Speech API as fallback
export async function playAudio(
  audioUrl?: string | null,
  text?: string,
  lang: string = 'ja-JP'
): Promise<void> {
  // If audio URL is provided, play from file
  if (audioUrl) {
    return playFromUrl(audioUrl);
  }

  // Fallback to Web Speech API
  if (text) {
    return playWithSpeechSynthesis(text, lang);
  }

  console.warn('No audio URL or text provided');
}

// Play audio from URL
export function playFromUrl(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);

    audio.onended = () => resolve();
    audio.onerror = e => reject(new Error(`Failed to play audio: ${e}`));

    audio.play().catch(reject);
  });
}

// Play using Web Speech API
export function playWithSpeechSynthesis(
  text: string,
  lang: string = 'ja-JP',
  rate: number = 0.9,
  pitch: number = 1.0
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSynthesisAvailable()) {
      reject(new Error('Speech synthesis not available'));
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Try to find a Japanese voice
    const voices = getJapaneseVoices();
    if (voices.length > 0) {
      // Prefer native Japanese voices
      const nativeVoice = voices.find(v => v.localService === false) || voices[0];
      utterance.voice = nativeVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = e => reject(new Error(`Speech synthesis error: ${e.error}`));

    window.speechSynthesis.speak(utterance);
  });
}

// Stop any currently playing audio
export function stopAudio(): void {
  if (isSpeechSynthesisAvailable()) {
    window.speechSynthesis.cancel();
  }
}

// Preload voices (call this early to ensure voices are available)
export function preloadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise(resolve => {
    if (!isSpeechSynthesisAvailable()) {
      resolve([]);
      return;
    }

    // Voices might already be loaded
    let voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Wait for voices to load
    window.speechSynthesis.onvoiceschanged = () => {
      voices = window.speechSynthesis.getVoices();
      resolve(voices);
    };

    // Timeout after 3 seconds
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices());
    }, 3000);
  });
}

// Audio player hook state interface
export interface AudioPlayerState {
  isPlaying: boolean;
  error: string | null;
}

// Play Japanese text with optimal settings
export async function playJapanese(text: string, audioUrl?: string | null): Promise<void> {
  return playAudio(audioUrl, text, 'ja-JP');
}

// Play example sentence (slightly slower for learning)
export async function playExampleSentence(text: string, audioUrl?: string | null): Promise<void> {
  if (audioUrl) {
    return playFromUrl(audioUrl);
  }

  // Slower rate for example sentences
  return playWithSpeechSynthesis(text, 'ja-JP', 0.8, 1.0);
}
