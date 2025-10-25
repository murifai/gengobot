'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GengoBot</h1>
            <div className="flex gap-4">
              {loading ? (
                <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              ) : user ? (
                <Link href="/dashboard">
                  <Button>Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="secondary">Sign In</Button>
                  </Link>
                  <Link href="/login">
                    <Button>Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Master Japanese Through
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
              AI-Powered Conversations
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Enhance your Japanese speaking skills through task-based interactive roleplay
            conversations powered by advanced AI technology.
          </p>
          <div className="flex gap-4 justify-center">
            {!loading && !user && (
              <>
                <Link href="/login">
                  <Button size="lg" className="text-lg px-8 py-6">
                    Start Learning Free
                  </Button>
                </Link>
                <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                  Watch Demo
                </Button>
              </>
            )}
            {!loading && user && (
              <Link href="/dashboard">
                <Button size="lg" className="text-lg px-8 py-6">
                  Go to Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Task-Based Learning
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Practice Japanese through real-world scenarios and interactive tasks designed to
              improve your practical language skills.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              AI Characters
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Engage in natural conversations with AI-powered characters that adapt to your learning
              level and interests.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <div className="text-4xl mb-4">🎙️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Voice Recognition
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Improve your pronunciation with advanced voice recognition technology and get instant
              feedback on your speaking.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
