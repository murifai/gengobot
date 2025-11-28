'use client';

import { useEffect } from 'react';
import Script from 'next/script';

export function ReactEditLoader() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('@/lib/react-edit/core').then(({ createReactEdit }) => {
        const editor = createReactEdit({
          highlightColor: '#f97316', // orange to match your design
          onEdit: info => {
            console.group('🖊️ React Edit');
            console.log('Component:', info.componentName || '(unknown)');
            console.log('Location:', info.sourceLocation || '(unknown)');
            console.log('Original:', info.originalText);
            console.log('New:', info.newText);
            console.groupEnd();
          },
        });
        (window as unknown as { __REACT_EDIT__: typeof editor }).__REACT_EDIT__ = editor;
        console.log(
          '%c🖊️ react-edit ready! Press Ctrl+E to toggle edit mode',
          'color: #f97316; font-weight: bold'
        );
      });
    }
  }, []);

  // Only load react-grab in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return <Script src="https://unpkg.com/react-grab/dist/index.global.js" strategy="lazyOnload" />;
}
