'use client';

import React, { useState } from 'react';
import useWebRTCAudioSession from '@/hooks/use-webrtc';
import { Tool } from '@/types/conversation';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Send,
  MessageSquare,
  Volume2,
  VolumeX,
} from 'lucide-react';

const tools: Tool[] = [
  {
    name: 'getCurrentTime',
    description: 'Get the current time',
  },
];

export default function WebRTCChatPage() {
  // State for voice selection
  const [voice] = useState('alloy');
  const [textInput, setTextInput] = useState('');

  // WebRTC Audio Session Hook
  const {
    status,
    isSessionActive,
    audioIndicatorRef,
    handleStartStopClick,
    conversation,
    sendTextMessage,
    currentVolume,
  } = useWebRTCAudioSession(voice, tools);

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim() && isSessionActive) {
      sendTextMessage(textInput);
      setTextInput('');
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto max-w-4xl p-4 h-screen flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col h-full gap-4"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Voice Chat Assistant</h1>
            </div>
            {isSessionActive && (
              <Badge variant="default" className="animate-pulse">
                LIVE
              </Badge>
            )}
          </div>

          {/* Main Chat Area */}
          <Card className="flex-1 flex flex-col overflow-hidden">
            {/* Conversation Display */}
            <ScrollArea className="flex-1 p-4">
              {conversation.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
                  <Mic className="h-12 w-12 mb-4 opacity-50" />
                  <p className="text-lg">Start a session to begin your conversation</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conversation
                    .filter(msg => {
                      // Show final messages with text, or non-final assistant messages
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
            <div className="border-t border-gray-200 dark:border-gray-700 p-4 space-y-4">
              {/* Current User Transcript */}
              {isSessionActive && conversation.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3"
                >
                  <div className="flex items-start gap-2">
                    <Mic className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">
                        {conversation[conversation.length - 1]?.role === 'user' &&
                        !conversation[conversation.length - 1]?.isFinal
                          ? conversation[conversation.length - 1]?.status === 'speaking'
                            ? 'Listening...'
                            : conversation[conversation.length - 1]?.status === 'processing'
                              ? 'Processing...'
                              : 'Your message'
                          : 'Ready to listen'}
                      </p>
                      {conversation[conversation.length - 1]?.role === 'user' &&
                        !conversation[conversation.length - 1]?.isFinal && (
                          <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                            {conversation[conversation.length - 1]?.text || 'Speak now...'}
                          </p>
                        )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Audio Indicator and Volume */}
              <div className="flex items-center gap-4">
                <div
                  ref={audioIndicatorRef}
                  className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 transition-all duration-150 flex items-center justify-center"
                  style={{
                    transform: `scale(${1 + currentVolume * 0.5})`,
                    backgroundColor: currentVolume > 0.1 ? 'rgb(34, 197, 94)' : undefined,
                  }}
                >
                  {currentVolume > 0.1 ? (
                    <Volume2 className="h-4 w-4 text-white" />
                  ) : (
                    <VolumeX className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                    {status || 'Ready to connect'}
                  </div>
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-green-500"
                      initial={{ width: '0%' }}
                      animate={{ width: `${currentVolume * 100}%` }}
                      transition={{ duration: 0.1 }}
                    />
                  </div>
                </div>
              </div>

              {/* Control Buttons */}
              <Button
                onClick={handleStartStopClick}
                className="w-full h-12 text-lg font-semibold"
                variant={isSessionActive ? 'destructive' : 'default'}
              >
                {isSessionActive ? (
                  <>
                    <MicOff className="mr-2 h-5 w-5" />
                    End Session
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-5 w-5" />
                    Start Session
                  </>
                )}
              </Button>

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
