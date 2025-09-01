import { NextRequest, NextResponse } from 'next/server';
import { JarService } from '@/lib/services/jarService';
import { verifyToken } from '@/lib/utils/auth';

// GET: Get current jar and statistics
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const includeStats = searchParams.get('stats') === 'true';

    const currentJar = await JarService.getCurrentJar(user.userId);
    
    let stats = null;
    if (includeStats) {
      stats = await JarService.getJarStats(user.userId);
    }

    return NextResponse.json({
      success: true,
      data: {
        currentJar,
        stats
      }
    });

  } catch (error) {
    console.error('Error in GET /api/jars:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Add money to current jar
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { amount } = body;

    // Validate input
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount is required and must be greater than 0' },
        { status: 400 }
      );
    }

    if (amount > 50000) { // Set reasonable limit
      return NextResponse.json(
        { error: 'Amount cannot exceed 50,000' },
        { status: 400 }
      );
    }

    const result = await JarService.addMoneyToJar(user.userId, amount);

    if (result.Status === 'ERROR') {
      return NextResponse.json(
        { error: result.Message },
        { status: 400 }
      );
    }

    // Check if jar completed and return additional info
    const responseData: any = {
      success: true,
      message: result.Message,
      jarId: result.Jar_ID
    };

    if (result.New_Level) {
      responseData.jarCompleted = true;
      responseData.newLevel = result.New_Level;
      responseData.message += ` Congratulations! You've reached level ${result.New_Level}!`;
    }

    return NextResponse.json(responseData, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/jars:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
