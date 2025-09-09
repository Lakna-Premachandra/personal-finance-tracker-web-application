import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import { StudentDashboardService } from '@/lib/services/studentDashboardService';

// GET: Student Dashboard Data
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is a student
    if (user.type !== 'Student') {
      return NextResponse.json(
        { error: 'Access denied. Student access required.' },
        { status: 403 }
      );
    }

    // Get all dashboard data
    const dashboardData = await StudentDashboardService.getDashboardData(user.userId);

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error in GET /api/dashboard/student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET specific component data
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.type !== 'Student') {
      return NextResponse.json(
        { error: 'Access denied. Student access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { component } = body;

    let data;
    switch (component) {
      case 'summary':
        data = await StudentDashboardService.getSummary(user.userId);
        break;
      case 'transactions':
        data = await StudentDashboardService.getRecentTransactions(user.userId);
        break;
      case 'jar':
        data = await StudentDashboardService.getJarDetails(user.userId);
        break;
      case 'expenses':
        data = await StudentDashboardService.getExpenseBreakdown(user.userId);
        break;
      case 'leaderboard':
        data = await StudentDashboardService.getLeaderboard(user.userId);
        break;
      case 'goals':
        data = await StudentDashboardService.getGoalProgress(user.userId);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid component requested' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error in POST /api/dashboard/student:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}