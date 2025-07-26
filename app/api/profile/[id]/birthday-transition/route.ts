import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import { connectToDatabase, sql } from '@/lib/database/db';

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

    const { newUserType, employmentStatus = 'Unemployed' } = await request.json();
    
    if (!newUserType || !['Student', 'Young-Adult'].includes(newUserType)) {
      return NextResponse.json(
        { error: 'Valid user type is required (Student or Young-Adult)' },
        { status: 400 }
      );
    }

    const pool = await connectToDatabase();
    const dbRequest = pool.request();
    dbRequest.input('User_ID', sql.Int, requestedUserId);
    dbRequest.input('New_User_Type', sql.NVarChar(20), newUserType);
    if (newUserType === 'Young-Adult') {
      dbRequest.input('Employment_Status', sql.NVarChar(50), employmentStatus);
    }
    
    const result = await dbRequest.execute('sp_ProcessBirthdayTransition');
    const response = result.recordset[0];

    if (response.Type === 'Error') {
      return NextResponse.json(
        { error: response.Status },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: response.Status,
      newUserType: response.NewUserType,
      transitionCompleted: true
    });

  } catch (error: any) {
    console.error('Error processing birthday transition:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process birthday transition' },
      { status: 500 }
    );
  }
}
