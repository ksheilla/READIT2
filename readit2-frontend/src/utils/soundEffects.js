// Sound Effects Utility for READit2
// Uses Web Audio API and Speech Synthesis for engaging audio feedback

class SoundEffects {
  constructor() {
    this.audioContext = null;
    this.enabled = localStorage.getItem('readit2_sounds_enabled') !== 'false';
  }

  // Initialize Audio Context (lazy loading)
  getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Play a tone using Web Audio API
  playTone(frequency, duration = 200, type = 'sine') {
    if (!this.enabled) return;

    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration / 1000);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration / 1000);
    } catch (error) {
      console.error('Error playing tone:', error);
    }
  }

  // Success Sound (happy chord)
  playSuccess() {
    this.playTone(523.25, 150); // C
    setTimeout(() => this.playTone(659.25, 150), 100); // E
    setTimeout(() => this.playTone(783.99, 300), 200); // G
  }

  // Badge Earned Sound (triumphant)
  playBadgeEarned() {
    this.playTone(523.25, 100); // C
    setTimeout(() => this.playTone(659.25, 100), 120); // E
    setTimeout(() => this.playTone(783.99, 100), 240); // G
    setTimeout(() => this.playTone(1046.50, 400), 360); // C (high)
    
    // Add voice announcement
    setTimeout(() => {
      this.speak("Awesome! You earned a new badge!", 1.2, 1.3);
    }, 800);
  }

  // Streak Achievement Sound
  playStreakAchievement(days) {
    // Play ascending tones
    const notes = [261.63, 329.63, 392.00, 523.25]; // C, E, G, C
    notes.forEach((note, index) => {
      setTimeout(() => this.playTone(note, 100), index * 100);
    });

    // Voice announcement
    setTimeout(() => {
      this.speak(`Amazing! ${days} day reading streak! Keep it up!`, 1.1, 1.3);
    }, 500);
  }

  // Reflection Posted Sound
  playReflectionPosted() {
    this.playTone(659.25, 150); // E
    setTimeout(() => this.playTone(783.99, 300), 150); // G
    
    setTimeout(() => {
      this.speak("Great job sharing your thoughts!", 1.0, 1.2);
    }, 500);
  }

  // Like/Heart Sound (quick positive feedback)
  playLike() {
    this.playTone(880.00, 100, 'sine'); // A
  }

  // Level Up Sound
  playLevelUp() {
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99]; // Ascending scale
    notes.forEach((note, index) => {
      setTimeout(() => this.playTone(note, 80), index * 60);
    });

    setTimeout(() => {
      this.speak("You leveled up! Keep reading!", 1.1, 1.3);
    }, 600);
  }

  // Button Click Sound (subtle feedback)
  playClick() {
    this.playTone(800, 50, 'square');
  }

  // Error Sound (gentle notification)
  playError() {
    this.playTone(200, 200, 'sawtooth');
  }

  // Welcome Sound (when user logs in)
  playWelcome(userName) {
    this.playTone(523.25, 100);
    setTimeout(() => this.playTone(659.25, 100), 100);
    setTimeout(() => this.playTone(523.25, 200), 200);

    setTimeout(() => {
      this.speak(`Welcome back, ${userName}! Ready to read?`, 1.0, 1.2);
    }, 500);
  }

  // Book Recommendation Sound
  playRecommendation() {
    this.playTone(659.25, 150);
    setTimeout(() => this.playTone(783.99, 150), 150);
    setTimeout(() => this.playTone(880.00, 250), 300);

    setTimeout(() => {
      this.speak("Check out this great book recommendation!", 1.0, 1.2);
    }, 600);
  }

  // Text-to-Speech Helper
  speak(text, rate = 1.0, pitch = 1.0) {
    if (!this.enabled) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = 0.8;
      
      // Try to get a child-friendly voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith('en') && 
        (voice.name.toLowerCase().includes('female') || 
         voice.name.toLowerCase().includes('samantha'))
      ) || voices.find(voice => voice.lang.startsWith('en'));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (error) {
      console.error('Error with speech synthesis:', error);
    }
  }

  // Enable/Disable sounds
  setEnabled(enabled) {
    this.enabled = enabled;
    localStorage.setItem('readit2_sounds_enabled', enabled.toString());
  }

  isEnabled() {
    return this.enabled;
  }
}

// Export singleton instance
const soundEffects = new SoundEffects();
export default soundEffects;