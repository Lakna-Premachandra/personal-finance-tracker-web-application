import { NextRequest, NextResponse } from 'next/server';
import { JarService } from '@/lib/services/jarService';
import { verifyToken } from '@/lib/utils/auth';

// POST: Mark completed jar money as spent
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a student
    const isStudent = await JarService.isUserStudent(user.userId);
    if (!isStudent) {
      return NextResponse.json(
        { error: 'Jar saving feature is only available for students' },
        { status: 403 }
      );
    }

    const jarId = parseInt(params.id);
    if (isNaN(jarId)) {
      return NextResponse.json(
        { error: 'Invalid jar ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title,categoryId, description } = body;

    if (!title || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'Expense title is required' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json({ error: 'Expense category is required' }, { status: 400 });
    }

    const result = await JarService.markJarAsSpent(
      user.userId, 
      jarId, 
      title.trim(), 
      categoryId,
      description?.trim(),
    );

    if (result.Status === 'ERROR') {
      return NextResponse.json(
        { error: result.Message },
        { status: 400 }
      );
    }

    const responseData: any = {
      success: true,
      message: result.Message,
      expenseId: result.Expense_ID
    };

    if (result.New_Level) {
      responseData.newLevel = result.New_Level;
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in POST /api/jars/[id]/mark-spent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}