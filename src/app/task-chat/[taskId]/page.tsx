'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TaskObjective {
  id: string;
  description: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  learningObjectives: string[];
  successCriteria: string[];
}

export default function TaskConversationPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params?.taskId as string;

  const [task, setTask] = useState<Task | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [objectives, setObjectives] = useState<TaskObjective[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadTask = async () => {
    try {
      // TODO: Replace with actual API call
      const mockTask: Task = {
        id: taskId,
        title: 'Order Ramen at a Restaurant',
        description: 'Practice ordering food in Japanese at a ramen restaurant',
        difficulty: 'N5',
        learningObjectives: ['Food vocabulary', 'Polite ordering phrases', 'Menu navigation'],
        successCriteria: [
          'Greet the staff appropriately',
          'Order a dish with specifications',
          'Ask about recommendations',
          'Complete the transaction politely',
        ],
      };

      const mockObjectives: TaskObjective[] = mockTask.successCriteria.map((criteria, index) => ({
        id: `obj-${index}`,
        description: criteria,
        completed: false,
      }));

      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content:
          'いらっしゃいませ！ラーメン屋へようこそ。お席にどうぞ。(Welcome to the ramen shop! Please have a seat.)',
        timestamp: new Date(),
      };

      setTask(mockTask);
      setObjectives(mockObjectives);
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Failed to load task:', error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');

    // TODO: Call API to get AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'はい、かしこまりました。(Yes, certainly.)',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);

      // Mock progress update
      setProgress(prev => Math.min(prev + 25, 100));
    }, 1000);
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording
  };

  const completeTask = () => {
    router.push('/dashboard');
  };

  if (loading || !task) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-secondary text-xl">Loading task...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Header */}
      <div className="bg-tertiary-purple border-b border-gray-700 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/task-chat')}
              className="text-gray-400 hover:text-white"
            >
              ← Back
            </button>
            <div>
              <h1 className="text-white font-semibold">{task.title}</h1>
              <p className="text-gray-400 text-sm">{task.difficulty}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-gray-400 text-sm">Progress</p>
              <p className="text-white font-semibold">{progress}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.map(message => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-700 bg-tertiary-purple p-4">
            <div className="max-w-4xl mx-auto flex items-center space-x-3">
              <button
                onClick={toggleRecording}
                className={`p-3 rounded-full ${
                  isRecording ? 'bg-primary animate-pulse' : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                🎤
              </button>
              <input
                type="text"
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
                placeholder="Type your message in Japanese..."
                className="flex-1 bg-dark text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim()}
                className="bg-primary hover:bg-primary/90 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg transition-all"
              >
                Send
              </button>
            </div>
          </div>
        </div>

        {/* Objectives Sidebar */}
        <div className="w-80 bg-tertiary-purple border-l border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-white font-semibold mb-4">Task Objectives</h2>
          <div className="space-y-3">
            {objectives.map(objective => (
              <div
                key={objective.id}
                className={`p-3 rounded-lg ${
                  objective.completed ? 'bg-tertiary-green' : 'bg-dark'
                }`}
              >
                <div className="flex items-start space-x-2">
                  <div className="mt-1">
                    {objective.completed ? (
                      <span className="text-white">✓</span>
                    ) : (
                      <span className="text-gray-500">○</span>
                    )}
                  </div>
                  <p className={`text-sm ${objective.completed ? 'text-white' : 'text-gray-400'}`}>
                    {objective.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {progress === 100 && (
            <button
              onClick={completeTask}
              className="w-full mt-6 bg-primary hover:bg-primary/90 text-white py-3 rounded-lg font-semibold"
            >
              Complete Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Message Bubble Component
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[70%] rounded-lg p-4 ${
          isUser ? 'bg-primary text-white' : 'bg-tertiary-purple text-white'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className="text-xs opacity-70 mt-2">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
