import * as XLSX from 'xlsx';

export interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExportSheet {
  name: string;
  columns: ExportColumn[];
  data: Record<string, unknown>[];
}

export function createExcelWorkbook(sheets: ExportSheet[]): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(sheet => {
    // Transform data to array of arrays with headers
    const headers = sheet.columns.map(col => col.header);
    const rows = sheet.data.map(row =>
      sheet.columns.map(col => {
        const value = row[col.key];
        // Handle different types
        if (value === null || value === undefined) return '';
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'object') return JSON.stringify(value);
        return value;
      })
    );

    // Create worksheet
    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set column widths
    const colWidths = sheet.columns.map(col => ({
      wch: col.width || 15,
    }));
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheet.name);
  });

  return workbook;
}

export function workbookToBuffer(workbook: XLSX.WorkBook): Buffer {
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

// User analytics export columns
export const userAnalyticsColumns: ExportColumn[] = [
  { header: 'ID', key: 'id', width: 30 },
  { header: 'Name', key: 'name', width: 20 },
  { header: 'Email', key: 'email', width: 30 },
  { header: 'Proficiency', key: 'proficiency', width: 10 },
  { header: 'Age Range', key: 'ageRange', width: 12 },
  { header: 'Gender', key: 'gender', width: 10 },
  { header: 'Domicile', key: 'domicile', width: 20 },
  { header: 'Institution', key: 'institution', width: 25 },
  { header: 'Learning Duration', key: 'learningDuration', width: 18 },
  { header: 'Subscription', key: 'subscriptionPlan', width: 12 },
  { header: 'Created At', key: 'createdAt', width: 20 },
  { header: 'Last Updated', key: 'updatedAt', width: 20 },
];

// Earnings export columns
export const earningsColumns: ExportColumn[] = [
  { header: 'Payment ID', key: 'id', width: 30 },
  { header: 'User Email', key: 'userEmail', width: 30 },
  { header: 'Amount (IDR)', key: 'amount', width: 15 },
  { header: 'Status', key: 'status', width: 12 },
  { header: 'Plan', key: 'plan', width: 10 },
  { header: 'Billing Cycle', key: 'billingCycle', width: 15 },
  { header: 'Created At', key: 'createdAt', width: 20 },
  { header: 'Completed At', key: 'completedAt', width: 20 },
];

// Subscription metrics columns
export const subscriptionMetricsColumns: ExportColumn[] = [
  { header: 'Metric', key: 'metric', width: 25 },
  { header: 'Value', key: 'value', width: 15 },
  { header: 'Period', key: 'period', width: 15 },
];

// Practice statistics columns
export const practiceStatsColumns: ExportColumn[] = [
  { header: 'Task ID', key: 'taskId', width: 30 },
  { header: 'Task Title', key: 'taskTitle', width: 30 },
  { header: 'Category', key: 'category', width: 15 },
  { header: 'Difficulty', key: 'difficulty', width: 10 },
  { header: 'Total Attempts', key: 'totalAttempts', width: 15 },
  { header: 'Completions', key: 'completions', width: 12 },
  { header: 'Avg Duration (min)', key: 'avgDuration', width: 18 },
  { header: 'Avg Score', key: 'avgScore', width: 10 },
];

// Deck statistics columns
export const deckStatsColumns: ExportColumn[] = [
  { header: 'Deck ID', key: 'deckId', width: 30 },
  { header: 'Deck Name', key: 'deckName', width: 30 },
  { header: 'Creator Type', key: 'creatorType', width: 12 },
  { header: 'Card Count', key: 'cardCount', width: 12 },
  { header: 'Study Sessions', key: 'studySessions', width: 15 },
  { header: 'Total Reviews', key: 'totalReviews', width: 15 },
];
