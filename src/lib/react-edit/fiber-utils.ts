import type { FiberNode } from './types';

/**
 * Get the React fiber node from a DOM element
 */
export function getFiberFromElement(element: HTMLElement): FiberNode | null {
  // React attaches fiber to DOM elements with keys like __reactFiber$xxx
  for (const key of Object.keys(element)) {
    if (key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')) {
      return (element as unknown as Record<string, FiberNode>)[key];
    }
  }
  return null;
}

/**
 * Get display name of a React component from fiber
 */
export function getDisplayName(fiber: FiberNode): string | null {
  if (!fiber?.type) return null;

  if (typeof fiber.type === 'string') {
    return fiber.type; // Host element like 'div', 'span'
  }

  if (typeof fiber.type === 'function') {
    return fiber.type.displayName || fiber.type.name || null;
  }

  if (fiber.type?.displayName) {
    return fiber.type.displayName;
  }

  return null;
}

/**
 * Check if fiber is a user component (not React internal)
 */
function isUserComponent(name: string): boolean {
  // Skip React internals and common framework components
  const internalPatterns = [
    /^_/,
    /^use[A-Z]/,
    /^Fragment$/,
    /^Suspense$/,
    /^StrictMode$/,
    /^Provider$/,
    /^Consumer$/,
    /^Context$/,
    /^Profiler$/,
    /^ForwardRef$/,
    /^Memo$/,
    /^Lazy$/,
  ];

  return !internalPatterns.some(pattern => pattern.test(name));
}

/**
 * Get the nearest user-defined React component from a DOM element
 */
export function getComponentInfo(element: HTMLElement): {
  componentName: string | null;
  sourceLocation: string | null;
  componentStack: string[];
} {
  const fiber = getFiberFromElement(element);
  if (!fiber) {
    return { componentName: null, sourceLocation: null, componentStack: [] };
  }

  const stack: string[] = [];
  let componentName: string | null = null;
  let sourceLocation: string | null = null;

  // Traverse up the fiber tree to find component info
  let current: FiberNode | null = fiber;
  while (current) {
    const name = getDisplayName(current);

    if (name && typeof current.type === 'function') {
      // It's a component (not a host element)
      if (isUserComponent(name)) {
        stack.push(name);

        // First user component we find is the "owner"
        if (!componentName) {
          componentName = name;

          // Try to get source location
          if (current._debugSource) {
            const { fileName, lineNumber, columnNumber } = current._debugSource;
            sourceLocation = columnNumber
              ? `${fileName}:${lineNumber}:${columnNumber}`
              : `${fileName}:${lineNumber}`;
          }
        }
      }
    }

    current = current.return;
  }

  return { componentName, sourceLocation, componentStack: stack };
}

/**
 * Check if an element contains editable text
 */
export function hasEditableText(element: HTMLElement): boolean {
  // Skip certain elements
  const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'OBJECT', 'EMBED', 'SVG'];
  if (skipTags.includes(element.tagName)) {
    return false;
  }

  // Check if element has direct text content (not just from children)
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text && text.length > 0) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get direct text content of an element (excluding child elements)
 */
export function getDirectTextContent(element: HTMLElement): string {
  let text = '';
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || '';
    }
  }
  return text;
}

/**
 * Set direct text content of an element (preserving child elements)
 */
export function setDirectTextContent(element: HTMLElement, newText: string): void {
  // Find and update text nodes
  let updated = false;
  for (const node of element.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (!updated) {
        node.textContent = newText;
        updated = true;
      } else {
        // Remove extra text nodes
        node.textContent = '';
      }
    }
  }

  // If no text node found, prepend one
  if (!updated) {
    const textNode = document.createTextNode(newText);
    element.insertBefore(textNode, element.firstChild);
  }
}
