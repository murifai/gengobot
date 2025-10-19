import { Card } from '@/components/ui/Card'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default function AdminHomePage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Admin Dashboard
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your GengoBot application from here
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/admin/analytics">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Analytics
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              View system-wide analytics and user statistics
            </p>
            <Button className="w-full" size="sm">View Analytics</Button>
          </Card>
        </Link>

        <Link href="/admin/users">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Users
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Manage user accounts and permissions
            </p>
            <Button className="w-full" size="sm">Manage Users</Button>
          </Card>
        </Link>

        <Link href="/admin/characters">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Characters
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Create and manage AI characters
            </p>
            <Button className="w-full" size="sm">Manage Characters</Button>
          </Card>
        </Link>

        <Link href="/admin/settings">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Settings
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
              Configure application settings
            </p>
            <Button className="w-full" size="sm">View Settings</Button>
          </Card>
        </Link>
      </div>

      <div className="mt-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Characters</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
