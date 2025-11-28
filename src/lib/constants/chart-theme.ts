// Chart theme constants for neobrutalism styling
// Uses CSS variables from globals.css

export const CHART_COLORS = {
  chart1: 'var(--chart-1)', // #f2727d pink/salmon
  chart2: 'var(--chart-2)', // #73cfd9 cyan
  chart3: 'var(--chart-3)', // #7fbf50 green
  chart4: 'var(--chart-4)', // #f2eda0 yellow
  chart5: 'var(--chart-5)', // #d99ad5 purple
} as const;

// JLPT level colors - gradient from easy to hard
export const JLPT_COLORS = {
  N5: '#22c55e', // green - easiest
  N4: '#84cc16', // lime
  N3: '#eab308', // yellow
  N2: '#f97316', // orange
  N1: '#ef4444', // red - hardest
} as const;

// Subscription tier colors
export const TIER_COLORS = {
  FREE: '#94a3b8', // slate
  BASIC: '#3b82f6', // blue
  PRO: '#8b5cf6', // violet
} as const;

// Tier labels for display
export const TIER_LABELS = {
  FREE: 'Free',
  BASIC: 'Basic',
  PRO: 'Pro',
} as const;

// JLPT level order for sorting
export const JLPT_LEVEL_ORDER = ['N5', 'N4', 'N3', 'N2', 'N1'] as const;
