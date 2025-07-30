import { NextRequest, NextResponse } from 'next/server';
import { GoalService } from '@/lib/services/goalService';
import { verifyToken } from '@/lib/utils/auth';

// POST: Contribute to a goal
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

    const body = await request.json();
    const { amount } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount is required and must be greater than 0' },
        { status: 400 }
      );
    }

    const goalId = parseInt(params.id);
    if (isNaN(goalId)) {
      return NextResponse.json(
        { error: 'Invalid goal ID' },
        { status: 400 }
      );
    }

    const result = await GoalService.contributeToGoal(user.userId, goalId, parseFloat(amount));

    if (result.Status === 'ERROR') {
      return NextResponse.json(
        { error: result.Message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.Message
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/goals/[id]/contribute:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
