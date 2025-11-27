import type { ReactEditConfig, ReactEditAPI, EditInfo } from './types';
import {
  getComponentInfo,
  hasEditableText,
  getDirectTextContent,
  setDirectTextContent,
} from './fiber-utils';
import {
  injectStyles,
  removeStyles,
  showOverlay,
  hideOverlay,
  removeOverlay,
  showBadge,
  hideBadge,
  showToast,
  addEditingClass,
  removeEditingClass,
} from './ui';

const DEFAULT_CONFIG: Required<ReactEditConfig> = {
  activationKey: 'e',
  useModifier: true,
  highlightColor: '#3b82f6',
  onEdit: () => {},
  onModeChange: () => {},
};

// Save edit to JSON file via API
async function saveEditToFile(editInfo: EditInfo): Promise<void> {
  try {
    const response = await fetch('/api/dev/react-edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page: window.location.pathname,
        componentName: editInfo.componentName || null,
        sourceLocation: editInfo.sourceLocation || null,
        originalText: editInfo.originalText,
        newText: editInfo.newText,
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log('%c📁 Edit saved to: ' + result.savedTo, 'color: #22c55e; font-weight: bold');
      if (result.fileToEdit) {
        console.log('%c📝 File to edit: ' + result.fileToEdit, 'color: #3b82f6');
      }
    } else {
      console.error('Failed to save edit:', result.error);
    }
  } catch (error) {
    console.error('Failed to save edit to file:', error);
  }
}

export function createReactEdit(userConfig: ReactEditConfig = {}): ReactEditAPI {
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  let isActive = false;
  let currentElement: HTMLElement | null = null;
  let editingElement: HTMLElement | null = null;
  let originalText = '';
  const edits: EditInfo[] = [];
  let abortController: AbortController | null = null;

  function handleMouseMove(e: MouseEvent): void {
    if (!isActive || editingElement) return;

    const target = e.target as HTMLElement;

    // Skip our own UI elements
    if (
      target.closest('.react-edit-overlay') ||
      target.closest('.react-edit-badge') ||
      target.closest('.react-edit-toast')
    ) {
      hideOverlay();
      currentElement = null;
      return;
    }

    // Only highlight elements with editable text
    if (hasEditableText(target)) {
      currentElement = target;
      const { componentName } = getComponentInfo(target);
      showOverlay(target, componentName);
    } else {
      hideOverlay();
      currentElement = null;
    }
  }

  function startEditing(element: HTMLElement): void {
    editingElement = element;
    originalText = getDirectTextContent(element);

    // Make element editable
    element.contentEditable = 'true';
    element.focus();
    addEditingClass(element);
    hideOverlay();

    // Select all text
    const range = document.createRange();
    range.selectNodeContents(element);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }

  function finishEditing(save: boolean): void {
    if (!editingElement) return;

    const newText = getDirectTextContent(editingElement);
    editingElement.contentEditable = 'false';
    removeEditingClass(editingElement);

    if (save && newText !== originalText) {
      const { componentName, sourceLocation, componentStack } = getComponentInfo(editingElement);

      const editInfo: EditInfo = {
        element: editingElement,
        originalText,
        newText,
        componentName: componentName || undefined,
        sourceLocation: sourceLocation || undefined,
        componentStack,
      };

      edits.push(editInfo);
      config.onEdit(editInfo);

      // Save to JSON file
      saveEditToFile(editInfo);

      // Show feedback
      showToast(`Saved! Check .react-edit/ folder`);

      // Log to console for dev reference
      console.group('🖊️ React Edit');
      console.log('Component:', componentName || '(unknown)');
      console.log('Location:', sourceLocation || '(unknown)');
      console.log('Original:', originalText);
      console.log('New:', newText);
      console.log('Stack:', componentStack);
      console.groupEnd();
    } else if (!save) {
      // Restore original text
      setDirectTextContent(editingElement, originalText);
    }

    editingElement = null;
    originalText = '';
  }

  function handleClick(e: MouseEvent): void {
    if (!isActive) return;

    // If we're editing, clicks outside should finish editing
    if (editingElement) {
      if (!editingElement.contains(e.target as Node)) {
        e.preventDefault();
        e.stopPropagation();
        finishEditing(true);
      }
      return;
    }

    // Start editing the current element
    if (currentElement) {
      e.preventDefault();
      e.stopPropagation();
      startEditing(currentElement);
    }
  }

  function handleKeyDown(e: KeyboardEvent): void {
    // Handle activation/deactivation
    const isActivationKey = e.key.toLowerCase() === config.activationKey.toLowerCase();
    const hasModifier = config.useModifier ? e.ctrlKey || e.metaKey : true;

    if (isActivationKey && hasModifier) {
      e.preventDefault();
      toggle();
      return;
    }

    // Handle editing keys
    if (editingElement) {
      if (e.key === 'Escape') {
        e.preventDefault();
        finishEditing(false); // Cancel
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        finishEditing(true); // Save
      }
    }
  }

  function activate(): void {
    if (isActive) return;
    isActive = true;

    injectStyles(config.highlightColor);
    showBadge();
    config.onModeChange(true);

    // Set up event listeners
    abortController = new AbortController();
    const { signal } = abortController;

    document.addEventListener('mousemove', handleMouseMove, { signal });
    document.addEventListener('click', handleClick, { capture: true, signal });
    document.addEventListener('keydown', handleKeyDown, { signal });

    showToast('Edit mode activated - click text to edit');
  }

  function deactivate(): void {
    if (!isActive) return;

    // Finish any active edit
    if (editingElement) {
      finishEditing(true);
    }

    isActive = false;
    hideOverlay();
    hideBadge();
    config.onModeChange(false);

    // Clean up event listeners
    abortController?.abort();
    abortController = null;

    showToast('Edit mode deactivated');
  }

  function toggle(): void {
    if (isActive) {
      deactivate();
    } else {
      activate();
    }
  }

  function destroy(): void {
    deactivate();
    removeOverlay();
    removeStyles();
    edits.length = 0;
  }

  // Set up global keyboard listener for activation (always active)
  document.addEventListener('keydown', e => {
    if (!isActive) {
      const isActivationKey = e.key.toLowerCase() === config.activationKey.toLowerCase();
      const hasModifier = config.useModifier ? e.ctrlKey || e.metaKey : true;

      if (isActivationKey && hasModifier) {
        e.preventDefault();
        activate();
      }
    }
  });

  return {
    activate,
    deactivate,
    toggle,
    isActive: () => isActive,
    getEdits: () => [...edits],
    clearEdits: () => {
      edits.length = 0;
    },
    destroy,
  };
}
