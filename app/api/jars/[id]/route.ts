import { NextRequest, NextResponse } from 'next/server';
import { JarService } from '@/lib/services/jarService';
import { verifyToken } from '@/lib/utils/auth';

// POST: Transfer completed jar money to a goal
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
    const { goalId } = body;

    if (!goalId) {
      return NextResponse.json(
        { error: 'Goal ID is required' },
        { status: 400 }
      );
    }

    const result = await JarService.transferToGoal(user.userId, jarId, goalId);

    if (result.Status === 'ERROR') {
      return NextResponse.json(
        { error: result.Message },
        { status: 400 }
      );
    }

    const responseData: any = {
      success: true,
      message: result.Message,
      goalId: result.Goal_ID
    };

    if (result.New_Level) {
      responseData.newLevel = result.New_Level;
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error in POST /api/jars/[id]/transfer-to-goal:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
