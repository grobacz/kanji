import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import LevelSelector from './LevelSelector';
import { useAppStore } from '../../store/appStore';

// Simple mock with default successful data
vi.mock('../../hooks/useKanjiData', () => ({
  useKanjiStats: vi.fn(() => ({
    data: [
      { level: 'N5', count: 20 },
      { level: 'N4', count: 10 },
      { level: 'N3', count: 10 },
      { level: 'N2', count: 10 },
      { level: 'N1', count: 10 },
    ],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
}));

const renderWithQuery = (component: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('LevelSelector', () => {
  beforeEach(() => {
    // Reset store
    useAppStore.getState().setSelectedLevel(null);
  });

  it('renders all JLPT levels', () => {
    renderWithQuery(<LevelSelector />);
    
    expect(screen.getByText('N1')).toBeInTheDocument();
    expect(screen.getByText('N2')).toBeInTheDocument();
    expect(screen.getByText('N3')).toBeInTheDocument();
    expect(screen.getByText('N4')).toBeInTheDocument();
    expect(screen.getByText('N5')).toBeInTheDocument();
  });

  it('allows selecting a level', () => {
    renderWithQuery(<LevelSelector />);
    
    const n5Button = screen.getByText('N5').closest('button');
    expect(n5Button).toBeInTheDocument();
    
    fireEvent.click(n5Button!);
    
    expect(useAppStore.getState().selectedLevel).toBe('N5');
  });

  it('shows confirmation when level is selected', () => {
    renderWithQuery(<LevelSelector />);
    
    const n3Button = screen.getByText('N3').closest('button');
    fireEvent.click(n3Button!);
    
    expect(screen.getByText('Level N3 Selected')).toBeInTheDocument();
  });
});