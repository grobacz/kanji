import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy, useEffect } from 'react';
import ErrorBoundary from './components/common/ErrorBoundary';
import Header from './components/common/Header';
import Navigation from './components/common/Navigation';

// Lazy load route components with preloading hints
const LevelSelector = lazy(() => 
  import(/* webpackChunkName: "level-selector" */ './components/LevelSelector/LevelSelector')
);
const WritingPractice = lazy(() => 
  import(/* webpackChunkName: "writing-practice" */ './components/WritingPractice/WritingPractice')
);
const Flashcards = lazy(() => 
  import(/* webpackChunkName: "flashcards" */ './components/Flashcards/Flashcards')
);

// Preload components on idle for better UX
const preloadComponents = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import('./components/WritingPractice/WritingPractice');
      import('./components/Flashcards/Flashcards');
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      import('./components/WritingPractice/WritingPractice');
      import('./components/Flashcards/Flashcards');
    }, 2000);
  }
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});


function App() {
  // Preload components after initial render
  useEffect(() => {
    preloadComponents();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-blue-900 dark:to-purple-900 flex flex-col relative overflow-hidden">
            {/* Beautiful animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-2xl animate-float"></div>
              <div className="absolute top-20 -left-20 w-48 h-48 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 rounded-full blur-2xl animate-float" style={{animationDelay: '2s'}}></div>
              <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-purple-400/10 to-pink-400/10 rounded-full blur-2xl animate-float" style={{animationDelay: '4s'}}></div>
            </div>
            
            <Header />
            <main 
              id="main-content" 
              className="flex-1 container mx-auto px-4 py-8 relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]"
              role="main"
              aria-live="polite"
            >
              <Routes>
                <Route path="/" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <LevelSelector />
                  </Suspense>
                } />
                <Route path="/level" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <LevelSelector />
                  </Suspense>
                } />
                <Route path="/write" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <WritingPractice />
                  </Suspense>
                } />
                <Route path="/flashcards" element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <Flashcards />
                  </Suspense>
                } />
                <Route path="*" element={
                  <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
                    <p className="text-gray-600 mb-6">The page you're looking for doesn't exist.</p>
                    <a 
                      href="/" 
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus-ring"
                    >
                      Go Home
                    </a>
                  </div>
                } />
              </Routes>
            </main>
            <Navigation />
          </div>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Router>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;