'use client';

import { useState, useRef, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { Button } from './Button';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  id?: string;
  required?: boolean;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
  rows = 8,
  className = '',
  id,
  required = false,
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Initialize content with sanitized HTML
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      const sanitized = DOMPurify.sanitize(value, {
        ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p'],
        ALLOWED_ATTR: [],
      });
      editorRef.current.innerHTML = sanitized;
    }
  }, [value]);

  const execCommand = (command: string, commandValue?: string) => {
    document.execCommand(command, false, commandValue);
    editorRef.current?.focus();
  };

  const handleInput = () => {
    if (editorRef.current) {
      // Sanitize the content before passing it up
      const sanitized = DOMPurify.sanitize(editorRef.current.innerHTML, {
        ALLOWED_TAGS: ['b', 'i', 'u', 'strong', 'em', 'br', 'p'],
        ALLOWED_ATTR: [],
      });
      onChange(sanitized);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  return (
    <div className={`border rounded-md ${isFocused ? 'ring-2 ring-blue-500' : ''} ${className}`}>
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b bg-gray-50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('bold')}
          className="px-3 py-1 hover:bg-gray-200 font-bold"
          title="Bold (Ctrl+B)"
        >
          B
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('italic')}
          className="px-3 py-1 hover:bg-gray-200 italic"
          title="Italic (Ctrl+I)"
        >
          I
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('underline')}
          className="px-3 py-1 hover:bg-gray-200 underline"
          title="Underline (Ctrl+U)"
        >
          U
        </Button>
        <div className="border-l mx-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand('removeFormat')}
          className="px-3 py-1 hover:bg-gray-200 text-sm"
          title="Clear Formatting"
        >
          Clear
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="p-3 outline-none font-mono text-sm empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
        style={{ minHeight: `${rows * 1.5}rem` }}
        id={id}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
    </div>
  );
}
