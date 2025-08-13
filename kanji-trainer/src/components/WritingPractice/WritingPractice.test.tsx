import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import WritingPractice from './WritingPractice';
import toast from 'react-hot-toast';

// Mock dependencies
const mockUseAppStore = vi.fn();
vi.mock('../../store/appStore', () => ({
  useAppStore: (selector: unknown) => mockUseAppStore(selector),
}));

const mockUseKanjiByLevel = vi.fn();
vi.mock('../../hooks/useKanjiData', () => ({
  useKanjiByLevel: (level: unknown) => mockUseKanjiByLevel(level),
}));

// Mock DrawingCanvas
vi.mock('./DrawingCanvas', () => ({
  default: ({ onStrokeComplete, onClear, disabled }: any) => (
    <div data-testid="drawing-canvas">
      <button 
        data-testid="mock-stroke"
        onClick={() => onStrokeComplete([[0, 0], [100, 100]])}
        disabled={disabled}
      >
        Add Stroke
      </button>
      <button data-testid="mock-clear" onClick={onClear}>
        Clear
      </button>
    </div>
  ),
}));

// Mock KanjiReference
vi.mock('./KanjiReference', () => ({
  default: ({ kanji }: any) => (
    <div data-testid="kanji-reference">
      Reference for {kanji.character}
    </div>
  ),
}));

// Mock stroke validation
vi.mock('../../utils/strokeValidation', () => ({
  validateKanjiDrawing: vi.fn(() => ({
    isValid: true,
    score: 85,
    feedback: ['✓ Correct number of strokes', 'Good pacing'],
    strokeCount: { expected: 1, actual: 1, correct: true },
    timing: { totalTime: 1000, averageStrokeTime: 1000, reasonable: true },
    coverage: { percentage: 75, adequate: true },
  })),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );
};

const mockKanjiData = [
  {
    id: 'test-1',
    character: '一',
    level: 'N5' as const,
    meanings: ['one'],
    readings: { onyomi: ['イチ'], kunyomi: ['ひと'] },
    strokes: 1,
    frequency: 1,
  },
  {
    id: 'test-2',
    character: '二',
    level: 'N5' as const,
    meanings: ['two'],
    readings: { onyomi: ['ニ'], kunyomi: ['ふた'] },
    strokes: 2,
    frequency: 2,
  },
];

describe('WritingPractice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows level selection prompt when no level is selected', () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = { selectedLevel: null };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <WritingPractice />
      </TestWrapper>
    );

    expect(screen.getByText('Please Select a Level First')).toBeInTheDocument();
    expect(screen.getByText('Go to Level Selection')).toBeInTheDocument();
  });

  it('shows loading state while fetching data', () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = { selectedLevel: 'N5' };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(
      <TestWrapper>
        <WritingPractice />
      </TestWrapper>
    );

    expect(screen.getByText('Loading kanji data...')).toBeInTheDocument();
  });

  it('shows error state when data loading fails', () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = { selectedLevel: 'N5' };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load'),
    });

    render(
      <TestWrapper>
        <WritingPractice />
      </TestWrapper>
    );

    expect(screen.getByText('Error Loading Kanji Data')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
  });

  it('renders writing practice interface when data is loaded', () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = { selectedLevel: 'N5' };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: mockKanjiData,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <WritingPractice />
      </TestWrapper>
    );

    expect(screen.getByText('Writing Practice - Level N5')).toBeInTheDocument();
    expect(screen.getByText('一')).toBeInTheDocument(); // Current kanji
    expect(screen.getByText(/Meanings:.*one/)).toBeInTheDocument();
    expect(screen.getByText('Strokes: 1')).toBeInTheDocument();
    expect(screen.getByTestId('drawing-canvas')).toBeInTheDocument();
  });

  it('navigates between kanji', () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = { selectedLevel: 'N5' };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: mockKanjiData,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <WritingPractice />
      </TestWrapper>
    );

    // Initially shows first kanji
    expect(screen.getByText('一')).toBeInTheDocument();

    // Click next button
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Should show second kanji
    expect(screen.getByText('二')).toBeInTheDocument();

    // Click previous button
    const prevButton = screen.getByText('Previous');
    fireEvent.click(prevButton);

    // Should show first kanji again
    expect(screen.getByText('一')).toBeInTheDocument();
  });

  it('shows/hides stroke reference', () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = { selectedLevel: 'N5' };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: mockKanjiData,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <WritingPractice />
      </TestWrapper>
    );

    // Reference should be hidden initially
    expect(screen.queryByTestId('kanji-reference')).not.toBeInTheDocument();

    // Click show reference button
    const showButton = screen.getByText('Show');
    fireEvent.click(showButton);

    // Reference should now be visible
    expect(screen.getByTestId('kanji-reference')).toBeInTheDocument();

    // Click hide button
    const hideButton = screen.getByText('Hide');
    fireEvent.click(hideButton);

    // Reference should be hidden again
    expect(screen.queryByTestId('kanji-reference')).not.toBeInTheDocument();
  });

  it('handles drawing and validation', async () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = { selectedLevel: 'N5' };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: mockKanjiData,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <WritingPractice />
      </TestWrapper>
    );

    // Add a stroke
    const addStrokeButton = screen.getByTestId('mock-stroke');
    fireEvent.click(addStrokeButton);

    // Check drawing button should be enabled
    const checkButton = screen.getByText('Check Drawing');
    expect(checkButton).not.toBeDisabled();

    // Click check drawing
    fireEvent.click(checkButton);

    // Should show checking state
    expect(screen.getByText('Checking...')).toBeInTheDocument();

    // Wait for validation to complete
    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    // Should show feedback
    expect(screen.getByText('✓ Valid attempt')).toBeInTheDocument();
    expect(screen.getByText('✓ Correct number of strokes')).toBeInTheDocument();
  });

  it('prevents validation when no strokes are drawn', () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = { selectedLevel: 'N5' };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: mockKanjiData,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <WritingPractice />
      </TestWrapper>
    );

    // Check drawing button should be disabled initially
    const checkButton = screen.getByText('Check Drawing');
    expect(checkButton).toBeDisabled();

    // Clicking should show error message
    fireEvent.click(checkButton);
    expect(toast.error).toHaveBeenCalledWith('Please draw something first');
  });

  it('clears canvas and resets state', () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = { selectedLevel: 'N5' };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: mockKanjiData,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <WritingPractice />
      </TestWrapper>
    );

    // Add a stroke first
    const addStrokeButton = screen.getByTestId('mock-stroke');
    fireEvent.click(addStrokeButton);

    // Clear button should be enabled
    const clearButton = screen.getByText('Clear');
    expect(clearButton).not.toBeDisabled();

    // Click clear
    fireEvent.click(clearButton);
    expect(toast.success).toHaveBeenCalledWith('Canvas cleared');
  });

  it('selects random kanji', () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = { selectedLevel: 'N5' };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: mockKanjiData,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <WritingPractice />
      </TestWrapper>
    );

    // Click random button
    const randomButton = screen.getByText('Random');
    fireEvent.click(randomButton);

    // Should show one of the kanji (test passes if no error)
    expect(screen.getByText(/[一二]/)).toBeInTheDocument();
  });

  it('tracks session statistics', async () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = { selectedLevel: 'N5' };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: mockKanjiData,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <WritingPractice />
      </TestWrapper>
    );

    // Add stroke and validate multiple times
    const addStrokeButton = screen.getByTestId('mock-stroke');
    const checkButton = screen.getByText('Check Drawing');

    // First attempt
    fireEvent.click(addStrokeButton);
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    // Clear and do second attempt
    fireEvent.click(screen.getByText('Clear'));
    fireEvent.click(addStrokeButton);
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    // Clear and do third attempt to trigger stats display
    fireEvent.click(screen.getByText('Clear'));
    fireEvent.click(addStrokeButton);
    fireEvent.click(checkButton);

    await waitFor(() => {
      expect(screen.getByText(/Session:/)).toBeInTheDocument();
    });
  });

  it('resets state when kanji changes', () => {
    mockUseAppStore.mockImplementation((selector) => {
      const state = { selectedLevel: 'N5' };
      return selector(state);
    });

    mockUseKanjiByLevel.mockReturnValue({
      data: mockKanjiData,
      isLoading: false,
      error: null,
    });

    render(
      <TestWrapper>
        <WritingPractice />
      </TestWrapper>
    );

    // Add stroke and get validation
    const addStrokeButton = screen.getByTestId('mock-stroke');
    fireEvent.click(addStrokeButton);

    // Navigate to next kanji
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    // Check button should be disabled again (state reset)
    const checkButton = screen.getByText('Check Drawing');
    expect(checkButton).toBeDisabled();
  });
});