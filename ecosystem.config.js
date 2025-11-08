/**
 * PM2 Ecosystem Configuration
 *
 * Process management configuration for production deployment
 *
 * Usage:
 *   pm2 start ecosystem.config.js
 *   pm2 restart gengobot
 *   pm2 logs gengobot
 *   pm2 monit
 */

module.exports = {
  apps: [
    {
      name: 'gengobot',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/var/www/gengobot',
      instances: 1, // Use 'max' for cluster mode (all CPU cores)
      exec_mode: 'fork', // Use 'cluster' for cluster mode
      watch: false, // Don't watch files in production
      max_memory_restart: '1G', // Restart if memory exceeds 1GB
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: '~/.pm2/logs/gengobot-error.log',
      out_file: '~/.pm2/logs/gengobot-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',
      listen_timeout: 10000,
      kill_timeout: 5000,
      wait_ready: true,

      // Advanced options
      exp_backoff_restart_delay: 100,
      restart_delay: 4000,

      // Node.js options
      node_args: '--max-old-space-size=2048',

      // Environment-specific configs
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
      },
    },
  ],

  // Optional: Deployment configuration
  deploy: {
    production: {
      user: 'your_username',
      host: 'your_vps_ip',
      ref: 'origin/main',
      repo: 'https://github.com/murifai/gengobotnew.git',
      path: '/var/www/gengobot',
      'pre-deploy-local': '',
      'post-deploy':
        'npm ci --only=production && npm run db:generate && npm run db:migrate && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': '',
    },
  },
};
