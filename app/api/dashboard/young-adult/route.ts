import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import { YoungAdultDashboardService } from '@/lib/services/youngAdultDashboardService';

// GET: Young Adult Dashboard Data
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is a young adult
    if (user.type !== 'Young-Adult') {
      return NextResponse.json(
        { error: 'Access denied. Young Adult access required.' },
        { status: 403 }
      );
    }

    // Get all dashboard data
    const dashboardData = await YoungAdultDashboardService.getDashboardData(user.userId);

    return NextResponse.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error('Error in GET /api/dashboard/young-adult:', error);
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

    if (user.type !== 'Young-Adult') {
      return NextResponse.json(
        { error: 'Access denied. Young Adult access required.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { component, year, month } = body;

    let data;
    switch (component) {
      case 'summary':
        data = await YoungAdultDashboardService.getSummary(user.userId);
        break;
      case 'transactions':
        data = await YoungAdultDashboardService.getRecentTransactions(user.userId);
        break;
      case 'reminders':
        data = await YoungAdultDashboardService.getPaymentReminders(user.userId);
        break;
      case 'expenses':
        data = await YoungAdultDashboardService.getExpenseBreakdown(user.userId, year, month);
        break;
      case 'trends':
        data = await YoungAdultDashboardService.getFinancialTrends(user.userId);
        break;
      case 'budgets':
        data = await YoungAdultDashboardService.getCurrentBudgets(user.userId);
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
    console.error('Error in POST /api/dashboard/young-adult:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}