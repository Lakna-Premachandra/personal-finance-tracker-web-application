import { NextRequest, NextResponse } from 'next/server';
import { JarService } from '@/lib/services/jarService';
import { verifyToken } from '@/lib/utils/auth';

// GET: Get jar statistics
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

    const stats = await JarService.getJarStats(user.userId);

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error in GET /api/jars/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}