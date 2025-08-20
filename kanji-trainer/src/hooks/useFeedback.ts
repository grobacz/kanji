import { useCallback } from 'react';
import { conditionalFeedback } from '../utils/feedback';

/**
 * Hook for easy access to haptic and sound feedback
 */
export const useFeedback = () => {
  const buttonClick = useCallback(() => {
    conditionalFeedback.buttonClick();
  }, []);

  const success = useCallback(() => {
    conditionalFeedback.success();
  }, []);

  const error = useCallback(() => {
    conditionalFeedback.error();
  }, []);

  const cardFlip = useCallback(() => {
    conditionalFeedback.cardFlip();
  }, []);

  const levelSelect = useCallback(() => {
    conditionalFeedback.levelSelect();
  }, []);

  const drawing = useCallback(() => {
    conditionalFeedback.drawing();
  }, []);

  return {
    buttonClick,
    success,
    error,
    cardFlip,
    levelSelect,
    drawing,
  };
};