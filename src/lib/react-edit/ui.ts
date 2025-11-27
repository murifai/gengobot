const STYLES = `
  .react-edit-overlay {
    position: fixed;
    pointer-events: none;
    border: 2px solid var(--re-color, #3b82f6);
    background: var(--re-color, #3b82f6);
    background-opacity: 0.1;
    border-radius: 4px;
    z-index: 999999;
    transition: all 0.1s ease-out;
  }

  .react-edit-overlay::before {
    content: attr(data-component);
    position: absolute;
    bottom: 100%;
    left: -2px;
    background: var(--re-color, #3b82f6);
    color: white;
    font-size: 11px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 2px 6px;
    border-radius: 4px 4px 0 0;
    white-space: nowrap;
    font-weight: 500;
  }

  .react-edit-badge {
    position: fixed;
    top: 16px;
    right: 16px;
    background: var(--re-color, #3b82f6);
    color: white;
    font-size: 12px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 8px 12px;
    border-radius: 6px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .react-edit-badge-dot {
    width: 8px;
    height: 8px;
    background: #22c55e;
    border-radius: 50%;
    animation: react-edit-pulse 1.5s infinite;
  }

  @keyframes react-edit-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .react-edit-editing {
    outline: 2px solid var(--re-color, #3b82f6) !important;
    outline-offset: 2px;
    background: rgba(59, 130, 246, 0.05) !important;
  }

  .react-edit-toast {
    position: fixed;
    bottom: 16px;
    right: 16px;
    background: #1f2937;
    color: white;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    padding: 12px 16px;
    border-radius: 8px;
    z-index: 999999;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    animation: react-edit-slide-in 0.2s ease-out;
  }

  @keyframes react-edit-slide-in {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

let styleElement: HTMLStyleElement | null = null;
let overlayElement: HTMLDivElement | null = null;
let badgeElement: HTMLDivElement | null = null;

export function injectStyles(highlightColor: string): void {
  if (styleElement) return;

  styleElement = document.createElement('style');
  styleElement.id = 'react-edit-styles';
  styleElement.textContent = STYLES;
  document.head.appendChild(styleElement);

  // Set CSS variable for color
  document.documentElement.style.setProperty('--re-color', highlightColor);
}

export function removeStyles(): void {
  if (styleElement) {
    styleElement.remove();
    styleElement = null;
  }
  document.documentElement.style.removeProperty('--re-color');
}

export function showOverlay(element: HTMLElement, componentName: string | null): void {
  if (!overlayElement) {
    overlayElement = document.createElement('div');
    overlayElement.className = 'react-edit-overlay';
    document.body.appendChild(overlayElement);
  }

  const rect = element.getBoundingClientRect();

  overlayElement.style.top = `${rect.top + window.scrollY}px`;
  overlayElement.style.left = `${rect.left + window.scrollX}px`;
  overlayElement.style.width = `${rect.width}px`;
  overlayElement.style.height = `${rect.height}px`;
  overlayElement.style.display = 'block';
  overlayElement.dataset.component = componentName || 'text';
}

export function hideOverlay(): void {
  if (overlayElement) {
    overlayElement.style.display = 'none';
  }
}

export function removeOverlay(): void {
  if (overlayElement) {
    overlayElement.remove();
    overlayElement = null;
  }
}

export function showBadge(): void {
  if (badgeElement) return;

  badgeElement = document.createElement('div');
  badgeElement.className = 'react-edit-badge';
  badgeElement.innerHTML = `
    <span class="react-edit-badge-dot"></span>
    <span>Edit Mode (Ctrl+E to exit)</span>
  `;
  document.body.appendChild(badgeElement);
}

export function hideBadge(): void {
  if (badgeElement) {
    badgeElement.remove();
    badgeElement = null;
  }
}

export function showToast(message: string, duration = 2000): void {
  const toast = document.createElement('div');
  toast.className = 'react-edit-toast';
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.2s ease-out';
    setTimeout(() => toast.remove(), 200);
  }, duration);
}

export function addEditingClass(element: HTMLElement): void {
  element.classList.add('react-edit-editing');
}

export function removeEditingClass(element: HTMLElement): void {
  element.classList.remove('react-edit-editing');
}
