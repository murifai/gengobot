'use client';

import { useEffect, useState } from 'react';

interface TaskResumeDialogProps {
  isOpen: boolean;
  taskTitle: string;
  onContinue: () => void;
  onStartNew: () => void;
  onCancel: () => void;
}

export default function TaskResumeDialog({
  isOpen,
  taskTitle,
  onContinue,
  onStartNew,
  onCancel,
}: TaskResumeDialogProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay for smooth animation
      setTimeout(() => setShow(true), 10);
    } else {
      setShow(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          show ? 'opacity-50' : 'opacity-0'
        }`}
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-background rounded-base border-2 border-border shadow-shadow max-w-md w-full transform transition-all duration-300 ${
            show ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        >
          {/* Header */}
          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-base border-2 border-border bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  Continue Previous Session?
                </h3>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6">
            <p className="text-muted-foreground mb-6">
              You have an ongoing conversation for{' '}
              <span className="font-semibold">{taskTitle}</span>.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Continue Button */}
              <button
                onClick={onContinue}
                className="w-full flex items-center justify-center px-4 py-3 font-medium rounded-base border-2 border-border shadow-shadow bg-primary text-primary-foreground hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Continue Where I Left Off
              </button>

              {/* Start New Button */}
              <button
                onClick={onStartNew}
                className="w-full flex items-center justify-center px-4 py-3 bg-background hover:bg-main/10 text-foreground font-medium rounded-base border-2 border-border shadow-shadow hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Start Fresh (New Attempt)
              </button>

              {/* Cancel Button */}
              <button
                onClick={onCancel}
                className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                Go Back to Tasks
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
