/**
 * Instrumentation setup for react-edit
 *
 * Import this file BEFORE React loads to enable enhanced component detection.
 *
 * Usage:
 * - Next.js 15.3+: Import in instrumentation-client.ts
 * - Vite: Import at the top of main.tsx before React
 * - Create React App: Import at the top of index.tsx before React
 */

declare global {
  interface Window {
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      renderers: Map<unknown, unknown>;
      supportsFiber: boolean;
      inject: () => void;
      onCommitFiberRoot: () => void;
      onCommitFiberUnmount: () => void;
      onPostCommitFiberRoot: () => void;
    };
    __REACT_EDIT_INSTRUMENTED__?: boolean;
  }
}

// Ensure React DevTools hook exists for fiber access
if (typeof window !== 'undefined') {
  // Create the hook if it doesn't exist
  if (!window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
      renderers: new Map(),
      supportsFiber: true,
      inject: () => {},
      onCommitFiberRoot: () => {},
      onCommitFiberUnmount: () => {},
      onPostCommitFiberRoot: () => {},
    };
  }

  // Mark that react-edit instrumentation is loaded
  window.__REACT_EDIT_INSTRUMENTED__ = true;

  console.log('%c🖊️ react-edit instrumentation loaded', 'color: #3b82f6; font-weight: bold');
}

export {};
