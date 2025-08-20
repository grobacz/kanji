// Haptic feedback utilities for enhanced user experience

export interface FeedbackOptions {
  intensity?: 'light' | 'medium' | 'heavy';
  duration?: number;
}

export interface SoundOptions {
  volume?: number;
  pitch?: number;
}

/**
 * Trigger haptic feedback if supported by the device
 */
export const hapticFeedback = (type: 'success' | 'error' | 'warning' | 'selection' | 'impact') => {
  // Check if haptic feedback is available
  if ('vibrate' in navigator) {
    const patterns = {
      success: [100, 50, 100],
      error: [200, 100, 200, 100, 200],
      warning: [150],
      selection: [50],
      impact: [75]
    };

    navigator.vibrate(patterns[type]);
  }

  // For iOS devices with Taptic Engine (WebKit)
  if ('Haptics' in window) {
    const intensities = {
      success: 'medium',
      error: 'heavy',
      warning: 'medium', 
      selection: 'light',
      impact: 'medium'
    };

    try {
      // @ts-expect-error - Haptics API not in TypeScript definitions
      window.Haptics.impact(intensities[type]);
    } catch {
      // Silently fail if Haptics API is not available
    }
  }
};

/**
 * Play subtle UI sounds for better feedback
 */
export const playSound = (type: 'click' | 'success' | 'error' | 'flip' | 'whoosh', options?: SoundOptions) => {
  // Create audio context for Web Audio API
  const createBeep = (frequency: number, duration: number, volume: number = 0.1) => {
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      
      // Clean up after sound finishes
      setTimeout(() => {
        oscillator.disconnect();
        gainNode.disconnect();
        audioContext.close();
      }, duration * 1000 + 100);
    } catch {
      // Silently fail if Web Audio API is not supported
    }
  };

  const volume = options?.volume || 0.1;
  
  switch (type) {
    case 'click':
      createBeep(800, 0.1, volume);
      break;
    case 'success':
      createBeep(600, 0.15, volume);
      setTimeout(() => createBeep(900, 0.15, volume), 100);
      break;
    case 'error':
      createBeep(300, 0.3, volume);
      break;
    case 'flip':
      createBeep(400, 0.1, volume);
      setTimeout(() => createBeep(500, 0.1, volume), 50);
      break;
    case 'whoosh':
      // Simulate whoosh with frequency sweep
      try {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
        
        setTimeout(() => {
          oscillator.disconnect();
          gainNode.disconnect();
          audioContext.close();
        }, 400);
      } catch {
        // Fallback to simple beep
        createBeep(150, 0.2, volume);
      }
      break;
  }
};

/**
 * Combined feedback for common UI interactions
 */
export const uiFeedback = {
  buttonClick: () => {
    hapticFeedback('selection');
    playSound('click');
  },
  
  success: () => {
    hapticFeedback('success');
    playSound('success');
  },
  
  error: () => {
    hapticFeedback('error');
    playSound('error');
  },
  
  cardFlip: () => {
    hapticFeedback('selection');
    playSound('flip');
  },
  
  levelSelect: () => {
    hapticFeedback('impact');
    playSound('whoosh');
  },
  
  drawing: () => {
    hapticFeedback('selection', { intensity: 'light' });
  }
};

/**
 * Check if user has enabled sound/haptic preferences
 */
export const getUserPreferences = () => {
  try {
    const prefs = localStorage.getItem('kanji-trainer-feedback-prefs');
    return prefs ? JSON.parse(prefs) : { 
      haptics: true, 
      sounds: true, 
      volume: 0.1 
    };
  } catch {
    return { haptics: true, sounds: true, volume: 0.1 };
  }
};

/**
 * Save user feedback preferences
 */
export const saveUserPreferences = (prefs: { haptics: boolean; sounds: boolean; volume: number }) => {
  try {
    localStorage.setItem('kanji-trainer-feedback-prefs', JSON.stringify(prefs));
  } catch {
    // Silently fail if localStorage is not available
  }
};

/**
 * Conditional feedback that respects user preferences
 */
export const conditionalFeedback = {
  buttonClick: () => {
    const prefs = getUserPreferences();
    if (prefs.haptics) hapticFeedback('selection');
    if (prefs.sounds) playSound('click', { volume: prefs.volume });
  },
  
  success: () => {
    const prefs = getUserPreferences();
    if (prefs.haptics) hapticFeedback('success');
    if (prefs.sounds) playSound('success', { volume: prefs.volume });
  },
  
  error: () => {
    const prefs = getUserPreferences();
    if (prefs.haptics) hapticFeedback('error');
    if (prefs.sounds) playSound('error', { volume: prefs.volume });
  },
  
  cardFlip: () => {
    const prefs = getUserPreferences();
    if (prefs.haptics) hapticFeedback('selection');
    if (prefs.sounds) playSound('flip', { volume: prefs.volume });
  },
  
  levelSelect: () => {
    const prefs = getUserPreferences();
    if (prefs.haptics) hapticFeedback('impact');
    if (prefs.sounds) playSound('whoosh', { volume: prefs.volume });
  },
  
  drawing: () => {
    const prefs = getUserPreferences();
    if (prefs.haptics) hapticFeedback('selection', { intensity: 'light' });
  }
};