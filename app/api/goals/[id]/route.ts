import { NextRequest, NextResponse } from 'next/server';
import { GoalService } from '@/lib/services/goalService';
import { verifyToken } from '@/lib/utils/auth';

// GET: Get goal by ID
export async function GET(
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

    const goal = await GoalService.getGoalById(goalId, user.userId);

    if (!goal) {
      return NextResponse.json(
        { error: 'Goal not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: goal
    });

  } catch (error) {
    console.error('Error in GET /api/goals/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update goal
export async function PUT(
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
    const { title, description, targetAmount, targetDate, categoryId, status } = body;

    // Validate input
    if (!title || !targetAmount || !targetDate || !categoryId) {
      return NextResponse.json(
        { error: 'Title, targetAmount, targetDate, and categoryId are required' },
        { status: 400 }
      );
    }

    if (targetAmount <= 0) {
      return NextResponse.json(
        { error: 'Target amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate target date - CANNOT BE IN THE PAST
    const parsedTargetDate = new Date(targetDate);
    if (isNaN(parsedTargetDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid target date format' },
        { status: 400 }
      );
    }

    // Check if target date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsedTargetDate.setHours(0, 0, 0, 0);
        
    if (parsedTargetDate <= today) {
      return NextResponse.json(
        { error: 'Target date cannot be in the past' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !['Active', 'Completed', 'Overdue', 'Achieved'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Available statuses: Active, Completed, Overdue, Achieved' },
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

    const goalInput = {
      title,
      description: description || '',
      targetAmount: parseFloat(targetAmount),
      targetDate: parsedTargetDate,
      categoryId: categoryId,
      status: status || undefined
    };

    const result = await GoalService.updateGoal(goalId, user.userId, goalInput);

    if (result.Status === 'ERROR') {
      return NextResponse.json(
        { error: result.Message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.Message
    });

  } catch (error) {
    console.error('Error in PUT /api/goals/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete goal
export async function DELETE(
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

    const result = await GoalService.deleteGoal(goalId, user.userId);

    if (result.Status === 'ERROR') {
      return NextResponse.json(
        { error: result.Message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.Message
    });

  } catch (error) {
    console.error('Error in DELETE /api/goals/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
