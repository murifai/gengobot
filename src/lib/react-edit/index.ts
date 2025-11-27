export { createReactEdit } from './core';
export type { ReactEditConfig, ReactEditAPI, EditInfo } from './types';

// Auto-initialize in development
declare const process: { env: { NODE_ENV?: string } } | undefined;

if (
  typeof window !== 'undefined' &&
  typeof process !== 'undefined' &&
  process.env.NODE_ENV === 'development'
) {
  // Provide a global for quick console access
  import('./core').then(({ createReactEdit }) => {
    const editor = createReactEdit();
    (window as unknown as { __REACT_EDIT__: typeof editor }).__REACT_EDIT__ = editor;

    console.log(
      '%c🖊️ react-edit ready! Press Ctrl+E to toggle edit mode',
      'color: #3b82f6; font-weight: bold'
    );
    console.log('%cOr use window.__REACT_EDIT__.activate()', 'color: #6b7280');
  });
}
