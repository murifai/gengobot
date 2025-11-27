export interface ReactEditConfig {
  /** Keyboard shortcut to activate edit mode (default: 'e') */
  activationKey?: string;
  /** Whether to use Ctrl/Cmd modifier (default: true) */
  useModifier?: boolean;
  /** Highlight color for editable elements (default: '#3b82f6') */
  highlightColor?: string;
  /** Callback when text is edited */
  onEdit?: (info: EditInfo) => void;
  /** Callback when edit mode is activated/deactivated */
  onModeChange?: (active: boolean) => void;
}

export interface EditInfo {
  /** The edited DOM element */
  element: HTMLElement;
  /** Original text content */
  originalText: string;
  /** New text content after edit */
  newText: string;
  /** React component name (if detected) */
  componentName?: string;
  /** Source file location (if available) */
  sourceLocation?: string;
  /** Fiber stack trace */
  componentStack?: string[];
}

export interface ReactEditAPI {
  /** Activate edit mode */
  activate: () => void;
  /** Deactivate edit mode */
  deactivate: () => void;
  /** Toggle edit mode */
  toggle: () => void;
  /** Check if edit mode is active */
  isActive: () => boolean;
  /** Get all edits made in this session */
  getEdits: () => EditInfo[];
  /** Clear edit history */
  clearEdits: () => void;
  /** Destroy the editor and clean up */
  destroy: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FiberType =
  | string
  | (((...args: any[]) => any) & { displayName?: string; name?: string })
  | { displayName?: string };

export interface FiberNode {
  type: FiberType;
  stateNode: Element | null;
  return: FiberNode | null;
  child: FiberNode | null;
  sibling: FiberNode | null;
  memoizedProps: Record<string, unknown>;
  _debugSource?: {
    fileName: string;
    lineNumber: number;
    columnNumber?: number;
  };
}
