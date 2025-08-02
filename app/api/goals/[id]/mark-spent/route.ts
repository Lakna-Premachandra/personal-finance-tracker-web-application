import { NextRequest, NextResponse } from 'next/server';
import { GoalService } from '@/lib/services/goalService';
import { verifyToken } from '@/lib/utils/auth';

// POST: Mark goal as spent
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

    const goalId = parseInt(params.id);
    if (isNaN(goalId)) {
      return NextResponse.json(
        { error: 'Invalid goal ID' },
        { status: 400 }
      );
    }

    const result = await GoalService.markGoalAsSpent(goalId, user.userId);

    if (result.Status === 'ERROR') {
      return NextResponse.json(
        { error: result.Message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.Message,
      data: {
        expenseId: result.Expense_ID
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Error in POST /api/goals/[id]/mark-spent:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
