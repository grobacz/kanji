import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import Flashcards from './Flashcards';

// Mock the store
const mockUseAppStore = vi.fn();
vi.mock('../../store/appStore', () => ({
  useAppStore: (selector: unknown) => mockUseAppStore(selector),
}));

// Mock the hook
const mockUseKanjiByLevel = vi.fn();
vi.mock('../../hooks/useKanjiData', () => ({
  useKanjiByLevel: (level: unknown) => mockUseKanjiByLevel(level),
}));

// Mock FlashcardDeck component
vi.mock('./FlashcardDeck', () => ({
  default: ({ session }: { session: { currentIndex: number; totalCount: number } }) => (
    <div data-testid="flashcard-deck">
      <div>{session.currentIndex + 1} of {session.totalCount}</div>
    </div>
  ),
}));

// Mock framer-motion components
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: { children: React.ReactNode }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const mockKanjiData = [
  {
    id: 'test-1',
    character: '漢',
    level: 'N2' as const,
    meanings: ['Chinese character'],
    readings: { onyomi: ['カン'], kunyomi: ['から'] },
    strokes: 13,
    frequency: 1250,
  },
];

describe('Flashcards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows level selection prompt when no level is selected', () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        selectedLevel: null,
        flashcardSession: null,
        resetFlashcardSession: vi.fn(),
      };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <Flashcards />
      </TestWrapper>
    );

    expect(screen.getByText('Please Select a Level First')).toBeInTheDocument();
    expect(screen.getByText('Go to Level Selection')).toBeInTheDocument();
  });

  it('shows loading state while fetching data', () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        selectedLevel: 'N2',
        flashcardSession: null,
        resetFlashcardSession: vi.fn(),
      };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(
      <TestWrapper>
        <Flashcards />
      </TestWrapper>
    );

    expect(screen.getByText('Loading kanji data...')).toBeInTheDocument();
  });

  it('shows error state when data loading fails', () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        selectedLevel: 'N2',
        flashcardSession: null,
        resetFlashcardSession: vi.fn(),
      };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load'),
    });

    render(
      <TestWrapper>
        <Flashcards />
      </TestWrapper>
    );

    expect(screen.getByText('Error Loading Kanji Data')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('shows start screen when level is selected and data is loaded', () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        selectedLevel: 'N2',
        flashcardSession: null,
        initializeFlashcardSession: vi.fn(),
        resetFlashcardSession: vi.fn(),
      };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: mockKanjiData,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <Flashcards />
      </TestWrapper>
    );

    expect(screen.getByText('Flashcards - Level N2')).toBeInTheDocument();
    expect(screen.getByText('Ready to Practice?')).toBeInTheDocument();
    expect(screen.getByText('Start Flashcard Session')).toBeInTheDocument();
    expect(screen.getByText('(1 kanji available)')).toBeInTheDocument();
  });

  it('starts flashcard session when start button is clicked', () => {
    const mockInitialize = vi.fn();
    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        selectedLevel: 'N2',
        flashcardSession: null,
        initializeFlashcardSession: mockInitialize,
        resetFlashcardSession: vi.fn(),
      };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: mockKanjiData,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <Flashcards />
      </TestWrapper>
    );

    fireEvent.click(screen.getByText('Start Flashcard Session'));
    expect(mockInitialize).toHaveBeenCalledWith(mockKanjiData);
  });

  it('renders FlashcardDeck when session is active', () => {
    const mockSession = {
      kanji: mockKanjiData,
      currentIndex: 0,
      showAnswer: false,
      correctCount: 0,
      incorrectCount: 0,
      totalCount: 1,
      isComplete: false,
      startTime: Date.now(),
    };

    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        selectedLevel: 'N2',
        flashcardSession: mockSession,
        nextCard: vi.fn(),
        previousCard: vi.fn(),
        toggleAnswer: vi.fn(),
        markCorrect: vi.fn(),
        markIncorrect: vi.fn(),
        resetFlashcardSession: vi.fn(),
      };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: mockKanjiData,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <Flashcards />
      </TestWrapper>
    );

    expect(screen.getByText('1 of 1')).toBeInTheDocument();
  });

  it('cleans up session on unmount', () => {
    const mockReset = vi.fn();
    mockUseAppStore.mockImplementation((selector) => {
      const state = {
        selectedLevel: 'N2',
        flashcardSession: null,
        resetFlashcardSession: mockReset,
      };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: mockKanjiData,
      isLoading: false,
      error: null,
    });

    const { unmount } = render(
      <TestWrapper>
        <Flashcards />
      </TestWrapper>
    );

    unmount();
    expect(mockReset).toHaveBeenCalled();
  });
});