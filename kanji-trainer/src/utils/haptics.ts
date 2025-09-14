// Haptic feedback utilities for mobile devices

export const HapticFeedbackType = {
  LIGHT: 'light',
  MEDIUM: 'medium', 
  HEAVY: 'heavy',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
} as const;

type HapticType = typeof HapticFeedbackType[keyof typeof HapticFeedbackType];

// Check if haptic feedback is available
export const isHapticsSupported = (): boolean => {
  return 'vibrate' in navigator || 'hapticFeedback' in navigator;
};

// Trigger haptic feedback
export const triggerHapticFeedback = (type: HapticType = 'light'): void => {
  try {
    // Modern haptic feedback API (iOS Safari, some Android browsers)
    if ('hapticFeedback' in navigator) {
      // @ts-expect-error - This is a newer API not in all TypeScript definitions yet
      navigator.hapticFeedback?.impact?.(type);
      return;
    }

    // Fallback to vibration API
    if ('vibrate' in navigator) {
      const vibrationPatterns = {
        light: [10],
        medium: [20],
        heavy: [30],
        success: [10, 50, 10],
        warning: [20, 100, 20],
        error: [30, 100, 30, 100, 30]
      };

      navigator.vibrate(vibrationPatterns[type] || vibrationPatterns.light);
    }
  } catch (error) {
    // Silently fail if haptics not supported
    console.debug('Haptic feedback not available:', error);
  }
};

// Convenience functions for common interactions
export const haptics = {
  tap: () => triggerHapticFeedback('light'),
  select: () => triggerHapticFeedback('medium'),
  success: () => triggerHapticFeedback('success'),
  error: () => triggerHapticFeedback('error'),
  cardFlip: () => triggerHapticFeedback('light'),
  correctAnswer: () => triggerHapticFeedback('success'),
  incorrectAnswer: () => triggerHapticFeedback('error'),
  navigation: () => triggerHapticFeedback('light'),
};