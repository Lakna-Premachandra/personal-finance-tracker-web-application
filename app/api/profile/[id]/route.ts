import { NextRequest, NextResponse } from 'next/server';
import { ProfileService } from '@/lib/services/profileService';
import { verifyToken } from '@/lib/utils/auth';
import { connectToDatabase, sql } from '@/lib/database/db';

const profileService = new ProfileService();

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

    const requestedUserId = parseInt(params.id);
    
    if (isNaN(requestedUserId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Users can only access their own profile
    if (user.userId !== requestedUserId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const result = await profileService.getUserById(requestedUserId);
    return NextResponse.json({
      success: true,
      data: result.user
    });
  } catch (error: any) {
    console.error('Error in GET /api/profile/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get user' },
      { status: 500 }
    );
  }
}

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

    const requestedUserId = parseInt(params.id);
    
    if (isNaN(requestedUserId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Users can only delete their own profile
    if (user.userId !== requestedUserId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const result = await profileService.deleteUser(requestedUserId);
    return NextResponse.json({
      success: true,
      message: result.message
    });
  } catch (error: any) {
    console.error('Error in DELETE /api/profile/[id]:', error);
    return NextResponse.json(
      { error: error.message || 'Profile deletion failed' },
      { status: 500 }
    );
  }
}

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

    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    if (user.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
 // Parse form data for file upload
  const formData = await request.formData();
      
  const updateData: any = {};
  
  // Extract text fields
  const username = formData.get('username') as string;
  const email = formData.get('email') as string;
  const dateOfBirth = formData.get('dateOfBirth') as string;
  const address = formData.get('address') as string;
  const phoneNo = formData.get('phoneNo') as string;
  const guardianContactNo = formData.get('guardianContactNo') as string;
  const employmentStatus = formData.get('employmentStatus') as string;
  
  // Extract profile picture file
  const profilePictureFile = formData.get('profilePicture') as File;

  // Add non-empty fields to updateData
  if (username && username.trim()) updateData.username = username.trim();
  if (email && email.trim()) updateData.email = email.trim();
  if (dateOfBirth && dateOfBirth.trim()) updateData.dateOfBirth = dateOfBirth.trim();
  if (address && address.trim()) updateData.address = address.trim();
  if (phoneNo && phoneNo.trim()) updateData.phoneNo = phoneNo.trim();
  if (guardianContactNo && guardianContactNo.trim()) updateData.guardianContactNo = guardianContactNo.trim();
  if (employmentStatus && employmentStatus.trim()) updateData.employmentStatus = employmentStatus.trim();
  
  // Add profile picture if provided
  if (profilePictureFile && profilePictureFile.size > 0) {
    updateData.profilePicture = profilePictureFile;
  }

  // Update profile using service
  const result = await profileService.updateUserProfile(userId, updateData);

  // Check if age transition occurred
  if (result.ageTransition) {
    return NextResponse.json({
      success: true,
      message: result.message,
      ageTransition: true,
      newAge: result.newAge,
      requiresDecision: true,
      profilePicture: result.profilePicture
    });
  }

  return NextResponse.json({
    success: true,
    message: result.message,
    profilePicture: result.profilePicture
  });

  } catch (error: any) {
  console.error('Error updating profile:', error);
  return NextResponse.json(
    { error: error.message || 'Failed to update profile' },
    { status: 500 }
  );
  }
  }