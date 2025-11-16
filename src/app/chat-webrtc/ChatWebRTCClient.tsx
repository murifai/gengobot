'use client';

import React, { useState, useEffect, useCallback } from 'react';
import useWebRTCAudioSession from '@/hooks/use-webrtc';
import { Tool } from '@/types/conversation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import { Mic, Send } from 'lucide-react';

const tools: Tool[] = [
  {
    type: 'function',
    name: 'getCurrentTime',
    description: 'Get the current time',
    parameters: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
];

export function ChatWebRTCClient() {
  const [voice] = useState('alloy');
  const [textInput, setTextInput] = useState('');

  // WebRTC Audio Session Hook
  const {
    isSessionActive,
    handleStartStopClick,
    conversation,
    sendTextMessage,
    // Push-to-Talk
    isPushToTalkActive,
    startPushToTalk,
    stopPushToTalk,
    // Token & Timer
    inputTokens,
    outputTokens,
    sessionDuration,
    estimatedCost,
  } = useWebRTCAudioSession(voice, tools);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && isSessionActive) {
      sendTextMessage(textInput);
      setTextInput('');
    }
  };

  // Format duration as MM:SS
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Spacebar keyboard shortcut for PTT
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space' && isSessionActive && !isPushToTalkActive) {
        e.preventDefault();
        startPushToTalk();
      }
    },
    [isSessionActive, isPushToTalkActive, startPushToTalk]
  );

  const handleKeyUp = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === 'Space' && isSessionActive && isPushToTalkActive) {
        e.preventDefault();
        stopPushToTalk();
      }
    },
    [isSessionActive, isPushToTalkActive, stopPushToTalk]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-4xl p-4 h-screen flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col h-full gap-4"
        >
          {/* Stats Bar */}
          {isSessionActive && (
            <div className="grid grid-cols-4 gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-sm">
              <div className="text-center">
                <div className="text-xs text-gray-500">Time</div>
                <div className="font-mono font-semibold">{formatDuration(sessionDuration)}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Input</div>
                <div className="font-mono font-semibold">{inputTokens.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Output</div>
                <div className="font-mono font-semibold">{outputTokens.toLocaleString()}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Cost</div>
                <div className="font-mono font-semibold text-green-600">
                  ${estimatedCost.toFixed(4)}
                </div>
              </div>
            </div>
          )}

          {/* Main Chat Area */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              {conversation.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                  <Mic className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">Press Space or Hold Button to Talk</p>
                  <p className="text-sm mt-2">Push-to-Talk mode saves ~50-75% cost</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversation
                    .filter(msg => {
                      if (msg.isFinal && msg.text) return true;
                      if (msg.role === 'assistant' && !msg.isFinal) return true;
                      return false;
                    })
                    .map(msg => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.text || '...'}</p>
                          {!msg.isFinal && (
                            <span className="text-xs opacity-70 ml-2">
                              {msg.status === 'speaking'
                                ? '🎤'
                                : msg.status === 'processing'
                                  ? '⏳'
                                  : ''}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                </div>
              )}
            </ScrollArea>

            {/* Controls Area */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-3">
              {/* PTT Status */}
              {isSessionActive && isPushToTalkActive && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-2 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Mic className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm font-medium text-primary">
                      Recording... Release to send
                    </span>
                  </div>
                </div>
              )}

              {/* Control Buttons */}
              {!isSessionActive ? (
                <Button
                  onClick={handleStartStopClick}
                  className="w-full h-12 text-lg font-semibold"
                  variant="default"
                >
                  <Mic className="mr-2 h-5 w-5" />
                  Start Session
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button
                    onMouseDown={startPushToTalk}
                    onMouseUp={stopPushToTalk}
                    onTouchStart={startPushToTalk}
                    onTouchEnd={stopPushToTalk}
                    className="w-full h-16 text-lg font-semibold"
                    variant={isPushToTalkActive ? 'destructive' : 'default'}
                  >
                    <Mic className="mr-2 h-6 w-6" />
                    {isPushToTalkActive ? 'Recording...' : 'Hold to Talk (or Space)'}
                  </Button>
                  <Button
                    onClick={handleStartStopClick}
                    className="w-full"
                    variant="outline"
                    size="sm"
                  >
                    End Session
                  </Button>
                </div>
              )}

              {/* Text Input */}
              {isSessionActive && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleSendText}
                  className="flex gap-2"
                >
                  <Input
                    value={textInput}
                    onChange={e => setTextInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </motion.form>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
