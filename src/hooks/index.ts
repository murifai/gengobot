/**
 * Custom Hooks Barrel Export
 *
 * Phase 4.5: User Experience Enhancement
 * Centralized export for all custom hooks
 */

// Responsive Design
export {
  useResponsive,
  useMediaQuery,
  type DeviceType,
  type Orientation,
  type ResponsiveState,
} from './useResponsive';

// Keyboard Shortcuts
export {
  useKeyboardShortcuts,
  useTaskKeyboardShortcuts,
  KeyboardShortcutsHelp,
  type KeyboardShortcut,
  type UseKeyboardShortcutsOptions,
  type KeyboardShortcutsHelpProps,
} from './useKeyboardShortcuts';

// Task Progress
export { useTaskProgress, useInterruptedTasks, type TaskProgress } from './useTaskProgress';

// Furigana Conversion
export { useFurigana } from './useFurigana';
