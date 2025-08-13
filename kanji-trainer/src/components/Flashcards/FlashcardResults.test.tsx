import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import FlashcardResults from './FlashcardResults';
import { FlashcardSession } from '../../types';

const createMockSession = (correct: number, incorrect: number): FlashcardSession => ({
  kanji: [
    {
      id: 'test-1',
      character: '漢',
      level: 'N2',
      meanings: ['Chinese character'],
      readings: { onyomi: ['カン'], kunyomi: ['から'] },
      strokes: 13,
      frequency: 1250,
    },
  ],
  currentIndex: 0,
  showAnswer: false,
  correctCount: correct,
  incorrectCount: incorrect,
  totalCount: correct + incorrect,
  isComplete: true,
  startTime: Date.now() - 60000, // 1 minute ago
});

describe('FlashcardResults', () => {
  it('displays session statistics correctly', () => {
    const session = createMockSession(8, 2);
    const mockRestart = vi.fn();
    const mockExit = vi.fn();

    render(
      <FlashcardResults
        session={session}
        onRestart={mockRestart}
        onExit={mockExit}
      />
    );

    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Correct')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('Incorrect')).toBeInTheDocument();
    expect(screen.getByText('80%')).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
  });

  it('shows appropriate message for high accuracy', () => {
    const session = createMockSession(9, 1);
    const mockRestart = vi.fn();
    const mockExit = vi.fn();

    render(
      <FlashcardResults
        session={session}
        onRestart={mockRestart}
        onExit={mockExit}
      />
    );

    expect(screen.getByText('Excellent work! 🎉')).toBeInTheDocument();
  });

  it('shows appropriate message for low accuracy', () => {
    const session = createMockSession(3, 7);
    const mockRestart = vi.fn();
    const mockExit = vi.fn();

    render(
      <FlashcardResults
        session={session}
        onRestart={mockRestart}
        onExit={mockExit}
      />
    );

    expect(screen.getByText('More practice needed! 💪')).toBeInTheDocument();
  });

  it('displays encouragement tip for accuracy below 80%', () => {
    const session = createMockSession(7, 3);
    const mockRestart = vi.fn();
    const mockExit = vi.fn();

    render(
      <FlashcardResults
        session={session}
        onRestart={mockRestart}
        onExit={mockExit}
      />
    );

    expect(screen.getByText(/Regular practice helps with retention/)).toBeInTheDocument();
  });

  it('does not show encouragement tip for high accuracy', () => {
    const session = createMockSession(9, 1);
    const mockRestart = vi.fn();
    const mockExit = vi.fn();

    render(
      <FlashcardResults
        session={session}
        onRestart={mockRestart}
        onExit={mockExit}
      />
    );

    expect(screen.queryByText(/Regular practice helps with retention/)).not.toBeInTheDocument();
  });

  it('calls onRestart when Practice Again button is clicked', () => {
    const session = createMockSession(8, 2);
    const mockRestart = vi.fn();
    const mockExit = vi.fn();

    render(
      <FlashcardResults
        session={session}
        onRestart={mockRestart}
        onExit={mockExit}
      />
    );

    fireEvent.click(screen.getByText('Practice Again'));
    expect(mockRestart).toHaveBeenCalledTimes(1);
  });

  it('calls onExit when Back to Menu button is clicked', () => {
    const session = createMockSession(8, 2);
    const mockRestart = vi.fn();
    const mockExit = vi.fn();

    render(
      <FlashcardResults
        session={session}
        onRestart={mockRestart}
        onExit={mockExit}
      />
    );

    fireEvent.click(screen.getByText('Back to Menu'));
    expect(mockExit).toHaveBeenCalledTimes(1);
  });

  it('displays session summary information', () => {
    const session = createMockSession(8, 2);
    const mockRestart = vi.fn();
    const mockExit = vi.fn();

    render(
      <FlashcardResults
        session={session}
        onRestart={mockRestart}
        onExit={mockExit}
      />
    );

    expect(screen.getByText('Session Summary')).toBeInTheDocument();
    expect(screen.getByText(/Total Cards:/)).toBeInTheDocument();
    expect(screen.getByText(/Total Time:/)).toBeInTheDocument();
    expect(screen.getByText(/Level:/)).toBeInTheDocument();
  });
});