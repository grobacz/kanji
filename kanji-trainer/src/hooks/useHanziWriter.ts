import { useEffect, useState } from 'react';

declare global {
  interface Window {
    HanziWriter: any;
  }
}

export function useHanziWriter() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Check if HanziWriter is already loaded
    if (typeof window !== 'undefined' && typeof window.HanziWriter !== 'undefined') {
      setIsLoaded(true);
      return;
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="hanzi-writer"]');
    if (existingScript) {
      // Script is already loading, wait for it
      const handleLoad = () => {
        setIsLoaded(true);
      };
      const handleError = () => {
        setIsError(true);
      };

      existingScript.addEventListener('load', handleLoad);
      existingScript.addEventListener('error', handleError);

      return () => {
        existingScript.removeEventListener('load', handleLoad);
        existingScript.removeEventListener('error', handleError);
      };
    }

    // Load HanziWriter script
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.7.2/dist/hanzi-writer.min.js';
    script.async = true;
    
    script.onload = () => {
      console.info('✓ HanziWriter loaded successfully');
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      console.error('❌ Failed to load HanziWriter');
      setIsError(true);
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return { isLoaded, isError, HanziWriter: isLoaded ? window.HanziWriter : null };
}