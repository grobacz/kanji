import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ErrorBoundary from './components/common/ErrorBoundary';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';
import LevelSelector from './components/LevelSelector/LevelSelector';

// Mock the kanji data hook to avoid loading states in tests
vi.mock('./hooks/useKanjiData', () => ({
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

describe('App', () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  const renderApp = (initialEntries = ['/']) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <ErrorBoundary>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Header />
              <main className="flex-1 container mx-auto px-4 py-8">
                <Routes>
                  <Route path="/" element={<LevelSelector />} />
                  <Route path="/level" element={<LevelSelector />} />
                </Routes>
              </main>
              <Navigation />
            </div>
          </ErrorBoundary>
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('renders without crashing', () => {
    renderApp();
    expect(screen.getByText('漢字 Trainer')).toBeInTheDocument();
  });

  it('renders level selector on root route', () => {
    renderApp(['/']);
    expect(screen.getByText('Choose Your JLPT Level')).toBeInTheDocument();
  });

  it('renders level selector on /level route', () => {
    renderApp(['/level']);
    expect(screen.getByText('Choose Your JLPT Level')).toBeInTheDocument();
  });

  it('renders navigation with correct items', () => {
    renderApp();
    expect(screen.getByText('Level')).toBeInTheDocument();
    expect(screen.getByText('Write')).toBeInTheDocument();
    expect(screen.getByText('Flashcards')).toBeInTheDocument();
  });
});