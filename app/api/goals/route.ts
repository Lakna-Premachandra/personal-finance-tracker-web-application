import { NextRequest, NextResponse } from 'next/server';
import { GoalService } from '@/lib/services/goalService';
import { verifyToken } from '@/lib/utils/auth';

// GET: Get all goals
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const result = await GoalService.getAllGoals(user.userId);

    return NextResponse.json({
      success: true,
      data: result.goals,
      summary: result.summary
    });

  } catch (error) {
    console.error('Error in GET /api/goals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Add new goal
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, targetAmount, targetDate, categoryId, startDate } = body;

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

    // Validate target date
    const parsedTargetDate = new Date(targetDate);
    if (isNaN(parsedTargetDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid target date format' },
        { status: 400 }
      );
    }

    // Check if target date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsedTargetDate.setHours(0, 0, 0, 0);
        
    if (parsedTargetDate <= today) {
      return NextResponse.json(
        { error: 'Target date must be in the future' },
        { status: 400 }
      );
    }

    // Validate start date if provided - CANNOT BE IN THE PAST
    if (startDate) {
      const parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid start date format' },
          { status: 400 }
        );
      }
      
      // Check if start date is in the past
      parsedStartDate.setHours(0, 0, 0, 0);
      if (parsedStartDate < today) {
        return NextResponse.json(
          { error: 'Start date cannot be in the past' },
          { status: 400 }
        );
      }
            
      if (parsedStartDate > parsedTargetDate) {
        return NextResponse.json(
          { error: 'Start date cannot be after target date' },
          { status: 400 }
        );
      }
    }

    const goalInput = {
      title,
      description: description || '',
      targetAmount: parseFloat(targetAmount),
      targetDate: parsedTargetDate,
      categoryId: categoryId,
      startDate: startDate ? new Date(startDate) : undefined
    };

    const result = await GoalService.addGoal(user.userId, goalInput);

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
         goalId: result.Goal_ID
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/goals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

