import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import FlashcardItem from './FlashcardItem';
import type { Kanji } from '../../types';

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

// Mock kanji with many meanings and readings to test overflow
const mockKanjiWithManyDetails: Kanji = {
  id: 'test-overflow',
  character: '行',
  level: 'N5',
  meanings: [
    'Go', 'Going', 'Travel', 'Trip', 'Journey', 'Walking', 'Moving', 'Action', 
    'Behavior', 'Conduct', 'Line', 'Row', 'Column', 'Bank', 'Procession',
    'Street', 'Road', 'Way', 'Path', 'Route', 'Course', 'Direction'
  ],
  readings: {
    onyomi: ['コウ', 'ギョウ', 'アン'],
    kunyomi: ['い.く', 'ゆ.く', 'おこな.う', 'おこ.なう', '-ゆ.き', '-ゆき', '-い.き', '-いき']
  },
  strokes: 6,
  frequency: 42,
};

// Extreme overflow test kanji
const mockKanjiExtremeOverflow: Kanji = {
  id: 'test-extreme-overflow',
  character: '超',
  level: 'N3',
  meanings: [
    'Very long meaning that should definitely cause overflow in smaller containers when combined with other meanings',
    'Another extremely long meaning that adds to the overflow problem by taking up significant vertical space',
    'Third meaning', 'Fourth meaning', 'Fifth meaning', 'Sixth meaning', 'Seventh meaning',
    'Eighth meaning', 'Ninth meaning', 'Tenth meaning', 'Eleventh meaning', 'Twelfth meaning',
    'Thirteenth meaning', 'Fourteenth meaning', 'Fifteenth meaning', 'Sixteenth meaning',
    'Seventeenth meaning that is particularly verbose and lengthy', 'Eighteenth meaning',
    'Nineteenth meaning', 'Twentieth meaning that should definitely push boundaries'
  ],
  readings: {
    onyomi: ['チョウ', 'ちょう', 'スーパー', 'エクストリーム', 'マックス', 'ウルトラ'],
    kunyomi: ['こ.える', 'こ.す', 'すぎ.る', 'とても.なが.い', 'ちょう.なが.い', 'きわめて.なが.い', 'ひじょう.に.なが.い']
  },
  strokes: 12,
  frequency: 500,
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
    
    expect(screen.getByText("On'yomi")).toBeInTheDocument();
    expect(screen.getByText('カン')).toBeInTheDocument();
    
    expect(screen.getByText("Kun'yomi")).toBeInTheDocument();
    expect(screen.getByText('から')).toBeInTheDocument();
    
    expect(screen.getByText('13 strokes')).toBeInTheDocument();
    expect(screen.getByText('Level N2')).toBeInTheDocument();
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
    expect(screen.queryByText("On'yomi")).not.toBeInTheDocument();
    expect(screen.queryByText("Kun'yomi")).not.toBeInTheDocument();
  });

  it('should handle overflow when card has many meanings and readings', () => {
    const mockToggle = vi.fn();
    
    // Mock a small viewport to force overflow conditions
    Object.defineProperty(window, 'innerHeight', { value: 400, writable: true });
    Object.defineProperty(window, 'innerWidth', { value: 375, writable: true });
    
    const { container } = render(
      <FlashcardItem
        kanji={mockKanjiWithManyDetails}
        showAnswer={true}
        onToggleAnswer={mockToggle}
      />
    );

    // Check that the card container has proper height constraints
    const cardContainer = container.querySelector('.card-height-clamp');
    expect(cardContainer).toBeInTheDocument();

    // Check that the main scrollable content area exists
    const scrollableArea = container.querySelector('.flex-1.overflow-y-auto.min-h-0');
    expect(scrollableArea).toBeInTheDocument();

    // Verify all meanings are present in the DOM (even if not visible due to overflow)
    mockKanjiWithManyDetails.meanings.forEach(meaning => {
      expect(screen.getByText(meaning)).toBeInTheDocument();
    });

    // Verify all readings are present in the DOM
    mockKanjiWithManyDetails.readings.onyomi.forEach(reading => {
      expect(screen.getByText(reading)).toBeInTheDocument();
    });
    mockKanjiWithManyDetails.readings.kunyomi.forEach(reading => {
      expect(screen.getByText(reading)).toBeInTheDocument();
    });

    // Test the actual layout issue: elements stacking vertically without proper space management
    const backCard = container.querySelector('[style*="rotateY(180deg)"]');
    expect(backCard).toBeInTheDocument();
    
    // The main issue is that the card tries to fit too much content vertically
    // This causes overlap between different sections
    const meaningsSection = container.querySelector('h3');
    const footerSection = container.querySelector('.mt-4');
    
    expect(meaningsSection).toBeInTheDocument();
    expect(footerSection).toBeInTheDocument();

    // CRITICAL TEST: Check that content doesn't overflow due to improper flex layout
    // The real issue is that the current layout can cause content to be cut off
    // or overlapped when there's insufficient vertical space
    
    // Check for proper flex layout that prevents overflow (updated selector for new structure)
    const cardContent = container.querySelector('.flex.flex-col.h-full.p-4') || 
                       container.querySelector('.flex.flex-col.h-full.p-6');
    expect(cardContent).toBeInTheDocument();
    
    // Verify that the main content area uses proper flex layout to handle overflow
    const flexContent = cardContent?.querySelector('.flex-1.overflow-y-auto.min-h-0');
    expect(flexContent).toBeInTheDocument();
    
    // This test validates that the card has proper overflow handling
    // Check that the layout has the right CSS classes for proper overflow handling
    if (flexContent) {
      expect(flexContent.classList.contains('flex-1')).toBe(true);
      expect(flexContent.classList.contains('overflow-y-auto')).toBe(true);
      expect(flexContent.classList.contains('min-h-0')).toBe(true);
    }
  });

  it('should handle extreme content with improved scrollable layout', () => {
    const mockToggle = vi.fn();
    
    const { container } = render(
      <FlashcardItem
        kanji={mockKanjiExtremeOverflow}
        showAnswer={true}
        onToggleAnswer={mockToggle}
      />
    );

    // Validate that the improved implementation handles extreme content properly
    const cardContainer = container.querySelector('.card-height-clamp');
    expect(cardContainer).toBeInTheDocument();
    
    const backCard = container.querySelector('[style*="rotateY(180deg)"]');
    expect(backCard).toBeInTheDocument();
    
    if (backCard) {
      // Check that the new layout structure exists
      const cardContent = backCard.querySelector('.flex.flex-col.h-full') as Element;
      expect(cardContent).toBeInTheDocument();
      
      // Verify the main scrollable area exists with proper classes
      const scrollableArea = cardContent?.querySelector('.flex-1.overflow-y-auto.min-h-0.space-y-4') as Element;
      expect(scrollableArea).toBeInTheDocument();
      
      // Verify all content is present in the DOM structure
      const totalMeanings = mockKanjiExtremeOverflow.meanings.length;
      
      // All meanings should be rendered in the DOM
      mockKanjiExtremeOverflow.meanings.forEach(meaning => {
        expect(screen.getByText(meaning)).toBeInTheDocument();
      });
      
      // Verify the layout structure that enables proper scrolling
      if (scrollableArea) {
        // Check that the scrollable area has the right CSS classes for overflow handling
        expect(scrollableArea.classList.contains('flex-1')).toBe(true);
        expect(scrollableArea.classList.contains('overflow-y-auto')).toBe(true);
        expect(scrollableArea.classList.contains('min-h-0')).toBe(true);
        
        // Count the actual meaning elements
        const meaningElements = scrollableArea.querySelectorAll('.px-3.py-1\\.5');
        expect(meaningElements.length).toBe(totalMeanings);
        
        // Ensure we have extreme content for this test
        expect(totalMeanings).toBeGreaterThan(15);
        
        // Verify readings are also present
        expect(screen.getByText("On'yomi")).toBeInTheDocument();
        expect(screen.getByText("Kun'yomi")).toBeInTheDocument();
      }
      
      // Check that footer is properly positioned
      const footer = cardContent?.querySelector('.mt-4.text-center');
      expect(footer).toBeInTheDocument();
    }
  });
});