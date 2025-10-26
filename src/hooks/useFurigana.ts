import { useEffect, useState, useCallback } from 'react';
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji';

let kuroshiroInstance: Kuroshiro | null = null;
let initializationPromise: Promise<void> | null = null;

/**
 * Hook for converting Japanese text to furigana using Kuroshiro
 * Handles initialization and provides conversion methods
 */
export function useFurigana() {
  const [isReady, setIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initKuroshiro = async () => {
      // If already initialized, just mark as ready
      if (kuroshiroInstance) {
        setIsReady(true);
        return;
      }

      // If initialization is in progress, wait for it
      if (initializationPromise) {
        try {
          await initializationPromise;
          setIsReady(true);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to initialize Kuroshiro'));
        }
        return;
      }

      // Start new initialization
      setIsInitializing(true);
      initializationPromise = (async () => {
        try {
          kuroshiroInstance = new Kuroshiro();
          await kuroshiroInstance.init(
            new KuromojiAnalyzer({
              dictPath: '/dict/',
            })
          );
          setIsReady(true);
          setIsInitializing(false);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('Failed to initialize Kuroshiro'));
          setIsInitializing(false);
          initializationPromise = null;
          throw err;
        }
      })();

      await initializationPromise;
    };

    initKuroshiro();
  }, []);

  /**
   * Convert Japanese text to HTML ruby tags with furigana
   */
  const convertToFurigana = useCallback(
    async (text: string): Promise<string> => {
      if (!kuroshiroInstance || !isReady) {
        throw new Error('Kuroshiro is not ready yet');
      }

      try {
        const result = await kuroshiroInstance.convert(text, {
          to: 'hiragana',
          mode: 'furigana',
        });
        return result;
      } catch (err) {
        console.error('Error converting to furigana:', err);
        throw err;
      }
    },
    [isReady]
  );

  /**
   * Convert Japanese text to romaji
   */
  const convertToRomaji = useCallback(
    async (text: string): Promise<string> => {
      if (!kuroshiroInstance || !isReady) {
        throw new Error('Kuroshiro is not ready yet');
      }

      try {
        const result = await kuroshiroInstance.convert(text, {
          to: 'romaji',
          mode: 'normal',
        });
        return result;
      } catch (err) {
        console.error('Error converting to romaji:', err);
        throw err;
      }
    },
    [isReady]
  );

  /**
   * Convert Japanese text to hiragana
   */
  const convertToHiragana = useCallback(
    async (text: string): Promise<string> => {
      if (!kuroshiroInstance || !isReady) {
        throw new Error('Kuroshiro is not ready yet');
      }

      try {
        const result = await kuroshiroInstance.convert(text, {
          to: 'hiragana',
          mode: 'normal',
        });
        return result;
      } catch (err) {
        console.error('Error converting to hiragana:', err);
        throw err;
      }
    },
    [isReady]
  );

  return {
    isReady,
    isInitializing,
    error,
    convertToFurigana,
    convertToRomaji,
    convertToHiragana,
  };
}
