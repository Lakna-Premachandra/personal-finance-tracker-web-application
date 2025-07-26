import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import { ProfileService } from '@/lib/services/profileService';

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

    const requestedUserId = parseInt(params.id);
    
    if (isNaN(requestedUserId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    if (user.userId !== requestedUserId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { dateOfBirth } = await request.json();
    
    if (!dateOfBirth) {
      return NextResponse.json(
        { error: 'Date of birth is required' },
        { status: 400 }
      );
    }

    const profileService = new ProfileService();
    const result = await profileService.checkAgeTransition(requestedUserId, dateOfBirth);
    
    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    console.error('Error in POST /api/profile/[id]/check-age-transition:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to check age transition' },
      { status: 500 }
    );
  }
}
