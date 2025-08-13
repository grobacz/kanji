import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import FlashcardItem from './FlashcardItem';
import { Kanji } from '../../types';

const mockKanji: Kanji = {
  id: 'test-1',
  character: '漢',
  level: 'N2',
  meanings: ['Chinese character', 'Han character'],
  readings: {
    onyomi: ['カン'],
    kunyomi: ['から'],
  },
  strokes: 13,
  frequency: 1250,
};

describe('FlashcardItem', () => {
  it('displays kanji character on front of card', () => {
    const mockToggle = vi.fn();
    render(
      <FlashcardItem
        kanji={mockKanji}
        showAnswer={false}
        onToggleAnswer={mockToggle}
      />
    );

    expect(screen.getAllByText('漢')).toHaveLength(2); // Front and back both render
    expect(screen.getByText('Tap to reveal meaning')).toBeInTheDocument();
  });

  it('displays meanings and readings when answer is shown', () => {
    const mockToggle = vi.fn();
    render(
      <FlashcardItem
        kanji={mockKanji}
        showAnswer={true}
        onToggleAnswer={mockToggle}
      />
    );

    expect(screen.getByText('Meanings')).toBeInTheDocument();
    expect(screen.getByText('Chinese character')).toBeInTheDocument();
    expect(screen.getByText('Han character')).toBeInTheDocument();
    
    expect(screen.getByText("On'yomi (Chinese reading)")).toBeInTheDocument();
    expect(screen.getByText('カン')).toBeInTheDocument();
    
    expect(screen.getByText("Kun'yomi (Japanese reading)")).toBeInTheDocument();
    expect(screen.getByText('から')).toBeInTheDocument();
    
    expect(screen.getByText('13 strokes • Level N2')).toBeInTheDocument();
  });

  it('calls onToggleAnswer when card is clicked', () => {
    const mockToggle = vi.fn();
    render(
      <FlashcardItem
        kanji={mockKanji}
        showAnswer={false}
        onToggleAnswer={mockToggle}
      />
    );

    const card = screen.getByText('Tap to reveal meaning').closest('.cursor-pointer');
    fireEvent.click(card!);

    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('handles kanji with no readings gracefully', () => {
    const kanjiNoReadings: Kanji = {
      ...mockKanji,
      readings: {
        onyomi: [],
        kunyomi: [],
      },
    };

    const mockToggle = vi.fn();
    render(
      <FlashcardItem
        kanji={kanjiNoReadings}
        showAnswer={true}
        onToggleAnswer={mockToggle}
      />
    );

    expect(screen.getByText('Meanings')).toBeInTheDocument();
    expect(screen.queryByText("On'yomi (Chinese reading)")).not.toBeInTheDocument();
    expect(screen.queryByText("Kun'yomi (Japanese reading)")).not.toBeInTheDocument();
  });
});