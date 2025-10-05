'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
  const router = useRouter();

  const stats = {
    totalTasks: 42,
    activeTasks: 38,
    totalUsers: 156,
    activeUsers: 89,
  };

  return (
    <div className="min-h-screen bg-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage tasks, users, and system settings</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Tasks" value={stats.totalTasks.toString()} icon="📚" />
          <StatCard title="Active Tasks" value={stats.activeTasks.toString()} icon="✓" />
          <StatCard title="Total Users" value={stats.totalUsers.toString()} icon="👥" />
          <StatCard title="Active Users" value={stats.activeUsers.toString()} icon="🟢" />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            title="Task Management"
            description="Create, edit, and manage learning tasks"
            icon="📝"
            onClick={() => router.push('/admin/tasks')}
          />
          <ActionCard
            title="User Management"
            description="View and manage user accounts"
            icon="👤"
            onClick={() => router.push('/admin/users')}
          />
          <ActionCard
            title="Analytics"
            description="View system analytics and reports"
            icon="📊"
            onClick={() => router.push('/admin/analytics')}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-tertiary-purple rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-white text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-tertiary-purple hover:bg-tertiary-purple/80 rounded-lg shadow-lg p-6 text-left transition-all"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </button>
  );
}
