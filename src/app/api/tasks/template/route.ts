import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

// GET /api/tasks/template - Download Excel template
export async function GET() {
  try {
    // Create sample data for the template
    const templateData = [
      {
        title: 'Example: Order Coffee at a Cafe',
        description: 'Practice ordering coffee and pastries at a Japanese cafe',
        category: 'Daily Conversation',
        subcategoryId: '',
        difficulty: 'N5',
        scenario: 'You are at a cafe and want to order a coffee and pastry',
        learningObjectives:
          'Practice polite requests, Learn food vocabulary, Use appropriate particles',
        conversationExample:
          'T: いらっしゃいませ。ご注文はお決まりですか？\nG: はい、コーヒーとケーキをください。\nT: かしこまりました。お飲み物は何にしますか？\nG: ホットコーヒーをお願いします。',
        estimatedDuration: '10',
        prerequisites: 'Basic greetings, Numbers 1-10',
        characterId: '',
        isActive: 'TRUE',
        // AI Configuration
        prompt: '',
        voice: 'alloy',
        speakingSpeed: '1.0',
      },
    ];

    // Create a new workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(templateData);

    // Set column widths
    ws['!cols'] = [
      { wch: 30 }, // title
      { wch: 50 }, // description
      { wch: 20 }, // category
      { wch: 20 }, // subcategoryId
      { wch: 12 }, // difficulty
      { wch: 50 }, // scenario
      { wch: 50 }, // learningObjectives
      { wch: 50 }, // conversationExample
      { wch: 15 }, // estimatedDuration
      { wch: 30 }, // prerequisites
      { wch: 30 }, // characterId
      { wch: 10 }, // isActive
      { wch: 80 }, // prompt
      { wch: 15 }, // voice
      { wch: 15 }, // speakingSpeed
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tasks');

    // Add instructions sheet
    const instructionsData = [
      {
        Field: 'title',
        Description: 'Task title (required)',
        Example: 'Order Coffee at a Cafe',
        Notes: 'Keep it concise and descriptive',
      },
      {
        Field: 'description',
        Description: 'Detailed description (required)',
        Example: 'Practice ordering coffee and pastries at a Japanese cafe',
        Notes: 'Explain what the learner will do',
      },
      {
        Field: 'category',
        Description: 'Task category (required)',
        Example: 'Daily Conversation',
        Notes: 'Use existing categories or create new ones',
      },
      {
        Field: 'subcategoryId',
        Description: 'Subcategory ID (optional)',
        Example: 'clx123abc',
        Notes: 'Leave blank if not using subcategories',
      },
      {
        Field: 'difficulty',
        Description: 'JLPT level (required)',
        Example: 'N5',
        Notes: 'Must be one of: N5, N4, N3, N2, N1',
      },
      {
        Field: 'scenario',
        Description: 'Scenario description (required)',
        Example: 'You are at a cafe and want to order a coffee and pastry',
        Notes: 'Set the context for the conversation',
      },
      {
        Field: 'learningObjectives',
        Description: 'Learning objectives (required)',
        Example: 'Practice polite requests, Learn food vocabulary, Use appropriate particles',
        Notes: 'Comma-separated list of objectives',
      },
      {
        Field: 'conversationExample',
        Description: 'Conversation example dialog (required)',
        Example: 'T: いらっしゃいませ\\nG: はい、コーヒーをください',
        Notes: 'Dialog format with T: (teacher) and G: (student). Use \\n for line breaks',
      },
      {
        Field: 'estimatedDuration',
        Description: 'Duration in minutes (optional)',
        Example: '10',
        Notes: 'Number only',
      },
      {
        Field: 'prerequisites',
        Description: 'Prerequisites (optional)',
        Example: 'Basic greetings, Numbers 1-10',
        Notes: 'Comma-separated list',
      },
      {
        Field: 'characterId',
        Description: 'Character ID (optional)',
        Example: 'clx456def',
        Notes: 'Leave blank for no character assignment',
      },
      {
        Field: 'isActive',
        Description: 'Active status (optional)',
        Example: 'TRUE',
        Notes: 'TRUE or FALSE, defaults to TRUE',
      },
      {
        Field: 'prompt',
        Description: 'AI system prompt (optional)',
        Example: 'You are a friendly barista at a Japanese cafe...',
        Notes: 'Custom AI persona/behavior instructions. Leave blank for auto-generated prompt',
      },
      {
        Field: 'voice',
        Description: 'OpenAI TTS voice (optional)',
        Example: 'alloy',
        Notes: 'Options: alloy, echo, fable, onyx, nova, shimmer. Defaults to alloy',
      },
      {
        Field: 'speakingSpeed',
        Description: 'Voice speaking speed (optional)',
        Example: '1.0',
        Notes: 'Range: 0.25 to 4.0. Defaults to 1.0',
      },
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
    wsInstructions['!cols'] = [
      { wch: 20 }, // Field
      { wch: 40 }, // Description
      { wch: 50 }, // Example
      { wch: 40 }, // Notes
    ];

    XLSX.utils.book_append_sheet(wb, wsInstructions, 'Instructions');

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return as downloadable file
    return new NextResponse(buf, {
      status: 200,
      headers: {
        'Content-Disposition': 'attachment; filename="task_import_template.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  } catch (error) {
    console.error('Error generating template:', error);
    return NextResponse.json({ error: 'Failed to generate template' }, { status: 500 });
  }
}
