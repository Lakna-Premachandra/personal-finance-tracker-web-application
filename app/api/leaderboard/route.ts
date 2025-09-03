import { NextRequest, NextResponse } from 'next/server';
import { LeaderboardService } from '@/lib/services/leaderboardService';
import { verifyToken } from '@/lib/utils/auth';

// GET: Get leaderboard data
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
    if (user.type !== 'Student') {
      return NextResponse.json(
        { error: 'Leaderboard feature is only available for students' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'eligibility':
        // Check user's eligibility for leaderboard
        const eligibility = await LeaderboardService.checkEligibility(user.userId);
        return NextResponse.json({
          success: true,
          data: eligibility
        });

      case 'stats':
        // Get leaderboard statistics
        const stats = await LeaderboardService.getLeaderboardStats(user.userId);
        return NextResponse.json({
          success: true,
          data: stats
        });

      case 'position':
        // Get user's current position
        const position = await LeaderboardService.getUserPosition(user.userId);
        return NextResponse.json({
          success: true,
          data: position
        });

      default:
        // Get full leaderboard
        const leaderboard = await LeaderboardService.getLeaderboard(user.userId);
        return NextResponse.json({
          success: true,
          data: leaderboard
        });
    }

  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Update leaderboard rankings (admin or cron job)
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
    const { action, adminSecret } = body;

    // For manual refresh, require admin secret or allow users to refresh their own data
    if (action === 'refresh') {
      // Allow cron job or admin access
      if (adminSecret && adminSecret === process.env.CRON_TEST_SECRET) {
        const result = await LeaderboardService.updateLeaderboard();
        return NextResponse.json({
          success: true,
          message: result.Message
        });
      }

      // Regular users can only trigger refresh if they are students
      if (user.type !== 'Student') {
        return NextResponse.json(
          { error: 'Leaderboard feature is only available for students' },
          { status: 403 }
        );
      }

      const result = await LeaderboardService.updateLeaderboard();
      return NextResponse.json({
        success: true,
        message: result.Message
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error in POST /api/leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}