import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as XLSX from 'xlsx';

// GET /api/tasks/export - Export tasks to Excel
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const difficulty = searchParams.get('difficulty');
    const isActive = searchParams.get('isActive');

    // Build filter
    const where: Record<string, unknown> = {};

    if (category && category !== 'all') {
      where.category = category;
    }

    if (difficulty && difficulty !== 'all') {
      where.difficulty = difficulty;
    }

    if (isActive !== null && isActive !== 'all') {
      where.isActive = isActive === 'true';
    }

    // Fetch tasks with related data
    const tasks = await prisma.task.findMany({
      where,
      include: {
        subcategory: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (tasks.length === 0) {
      return NextResponse.json({ error: 'No tasks found to export' }, { status: 404 });
    }

    // Transform tasks to export format
    const exportData = tasks.map(task => ({
      title: task.title,
      description: task.description,
      category: task.category,
      subcategoryId: task.subcategoryId || '',
      subcategoryName: task.subcategory?.name || '',
      difficulty: task.difficulty,
      scenario: task.scenario,
      learningObjectives: Array.isArray(task.learningObjectives)
        ? (task.learningObjectives as string[]).join(', ')
        : '',
      conversationExample: task.conversationExample,
      estimatedDuration: task.estimatedDuration?.toString() || '',
      isActive: task.isActive ? 'TRUE' : 'FALSE',
      prompt: task.prompt || '',
      voice: task.voice || 'alloy',
      speakingSpeed: task.speakingSpeed?.toString() || '1.0',
      usageCount: task.usageCount,
      averageScore: task.averageScore?.toFixed(1) || '',
      createdAt: task.createdAt.toISOString().split('T')[0],
      updatedAt: task.updatedAt.toISOString().split('T')[0],
    }));

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    ws['!cols'] = [
      { wch: 35 }, // title
      { wch: 50 }, // description
      { wch: 20 }, // category
      { wch: 25 }, // subcategoryId
      { wch: 20 }, // subcategoryName
      { wch: 12 }, // difficulty
      { wch: 50 }, // scenario
      { wch: 50 }, // learningObjectives
      { wch: 60 }, // conversationExample
      { wch: 15 }, // estimatedDuration
      { wch: 10 }, // isActive
      { wch: 80 }, // prompt
      { wch: 12 }, // voice
      { wch: 12 }, // speakingSpeed
      { wch: 12 }, // usageCount
      { wch: 12 }, // averageScore
      { wch: 12 }, // createdAt
      { wch: 12 }, // updatedAt
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks');

    // Add summary sheet
    const summaryData = [
      { Metric: 'Total Tasks', Value: tasks.length },
      { Metric: 'Active Tasks', Value: tasks.filter(t => t.isActive).length },
      { Metric: 'Inactive Tasks', Value: tasks.filter(t => !t.isActive).length },
      { Metric: 'N5 Tasks', Value: tasks.filter(t => t.difficulty === 'N5').length },
      { Metric: 'N4 Tasks', Value: tasks.filter(t => t.difficulty === 'N4').length },
      { Metric: 'N3 Tasks', Value: tasks.filter(t => t.difficulty === 'N3').length },
      { Metric: 'N2 Tasks', Value: tasks.filter(t => t.difficulty === 'N2').length },
      { Metric: 'N1 Tasks', Value: tasks.filter(t => t.difficulty === 'N1').length },
      { Metric: 'Export Date', Value: new Date().toISOString().split('T')[0] },
    ];

    // Add category breakdown
    const categories = [...new Set(tasks.map(t => t.category))];
    categories.forEach(cat => {
      summaryData.push({
        Metric: `Category: ${cat}`,
        Value: tasks.filter(t => t.category === cat).length,
      });
    });

    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    wsSummary['!cols'] = [{ wch: 25 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename with date
    const date = new Date().toISOString().split('T')[0];
    const filename = `tasks_export_${date}.xlsx`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Error exporting tasks:', error);
    return NextResponse.json({ error: 'Failed to export tasks' }, { status: 500 });
  }
}
