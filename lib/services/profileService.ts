import { connectToDatabase, sql } from '../database/db';
import { FileUploadService, FileUploadResult } from '../utils/fileUpload';

export interface UpdateProfileRequest {
  username?: string;
  email?: string;
  dateOfBirth?: string;
  address?: string;
  phoneNo?: string;
  guardianContactNo?: string; 
  employmentStatus?: string; 
  confirmTypeChange?: boolean; 
  newUserType?: 'Student' | 'Young-Adult'; 
  profilePicture?: File;
}

export interface AgeTransitionResponse {
  requiresTypeChange: boolean;
  currentAge: number;
  newUserType: 'Student' | 'Young-Adult';
  message: string;
}

export class ProfileService {
  
  async getUserById(userId: number) {
    const pool = await connectToDatabase();
    const request = pool.request();
    request.input('User_ID', sql.Int, userId);
    
    const result = await request.execute('sp_GetUserById');
    const user = result.recordset[0];
    
    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: {
        id: user.User_ID,
        username: user.Username,
        email: user.Email,
        dateOfBirth: user.DateOfBirth,
        address: user.Address,
        age: user.Age,
        phoneNo: user.Phone_No,
        type: user.Type,
        profilePicture: user.ProfilePicture,
        guardianContactNo: user.Guardian_Contact_No,
        employmentStatus: user.Employment_Status,
        createdDate: user.Created_Date,
        updatedDate: user.Updated_Date
      },
    };
  }

  async deleteUser(userId: number) {
    try {
      const userResult = await this.getUserById(userId);
      const oldProfilePicture = userResult.user.profilePicture;

      const pool = await connectToDatabase();
      const request = pool.request();
      request.input('User_ID', sql.Int, userId);
      
      const result = await request.execute('sp_DeleteUser');
      const response = result.recordset[0];
      
      if (response.Status === 'Success') {
        if (oldProfilePicture) {
          await FileUploadService.deleteOldProfilePicture(oldProfilePicture);
        }
        
        return {
          message: 'Profile deleted successfully',
        };
      } else {
        throw new Error('Profile deletion failed');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async checkAgeTransition(userId: number, dateOfBirth: string) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      // Calculate new age
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      // Get current user type
      request.input('User_ID', sql.Int, userId);
      const userResult = await request.query('SELECT Type FROM [User] WHERE User_ID = @User_ID');
      
      if (userResult.recordset.length === 0) {
        throw new Error('User not found');
      }

      const currentType = userResult.recordset[0].Type;
      
      return {
        currentAge: age,
        currentType: currentType,
        requiresTransition: currentType === 'Student' && age >= 18,
        canUpdateBirthday: currentType === 'Student'
      };

    } catch (error) {
      console.error('Error checking age transition:', error);
      throw error;
    }
  }

  async processBirthdayTransition(userId: number, newUserType: string) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      request.input('User_ID', sql.Int, userId);
      request.input('New_User_Type', sql.NVarChar(20), newUserType);
      
      if (newUserType === 'Young-Adult') {
        request.input('Employment_Status', sql.NVarChar(50), 'Unemployed');
      }
      
      const result = await request.execute('sp_ProcessBirthdayTransition');
      const response = result.recordset[0];

      if (response.Type === 'Error') {
        throw new Error(response.Status);
      }

      return {
        success: true,
        message: response.Status,
        newUserType: response.NewUserType
      };

    } catch (error) {
      console.error('Error processing birthday transition:', error);
      throw error;
    }
  }

  async updateUserProfile(userId: number, updateData: UpdateProfileRequest) {
    try {
      const pool = await connectToDatabase();
      const request = pool.request();
      
      // Get current user data to check for existing profile picture
      const currentUser = await this.getUserById(userId);
      const oldProfilePicture = currentUser.user.profilePicture;
      
      let profilePicturePath: string | undefined;
      
      // Handle profile picture upload
      if (updateData.profilePicture) {
        const uploadResult: FileUploadResult = await FileUploadService.uploadProfilePicture(
          updateData.profilePicture, 
          userId
        );
        
        if (!uploadResult.success) {
          throw new Error(uploadResult.error || 'Failed to upload profile picture');
        }
        
        profilePicturePath = uploadResult.filePath;
        
        // Delete old profile picture if exists and new one is uploaded successfully
        if (oldProfilePicture && profilePicturePath) {
          await FileUploadService.deleteOldProfilePicture(oldProfilePicture);
        }
      }
      
      request.input('User_ID', sql.Int, userId);
      
      // Add parameters only if they exist
      const fieldsToUpdate = { ...updateData };
      delete fieldsToUpdate.profilePicture; // Remove file from updateData
      
      Object.keys(fieldsToUpdate).forEach(key => {
        if (fieldsToUpdate[key as keyof UpdateProfileRequest] !== undefined && 
            fieldsToUpdate[key as keyof UpdateProfileRequest] !== null) {
          const paramName = this.mapFieldToParam(key);
          if (paramName) {
            if (key === 'dateOfBirth') {
              request.input(paramName, sql.Date, new Date(fieldsToUpdate[key as keyof UpdateProfileRequest] as string));
            } else {
              request.input(paramName, sql.NVarChar, fieldsToUpdate[key as keyof UpdateProfileRequest]!.toString());
            }
          }
        }
      });

      // Add profile picture parameter if uploaded
      if (profilePicturePath) {
        request.input('ProfilePicture', sql.NVarChar(500), profilePicturePath);
      }

      const result = await request.execute('sp_UpdateUserWithRestrictions');
      const response = result.recordset[0];

      if (response.Type === 'Error') {
        // If database update failed and we uploaded a new picture, clean it up
        if (profilePicturePath) {
          await FileUploadService.deleteOldProfilePicture(profilePicturePath);
        }
        throw new Error(response.Status);
      }

      return {
        success: true,
        message: response.Status,
        ageTransition: response.Type === 'AgeTransition',
        newAge: response.NewAge,
        profilePicture: profilePicturePath || oldProfilePicture
      };

    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  private mapFieldToParam(fieldName: string): string | null {
    const mapping: { [key: string]: string } = {
      'username': 'Username',
      'email': 'Email',
      'dateOfBirth': 'DateOfBirth',
      'address': 'Address',
      'phoneNo': 'Phone_No',
      'guardianContactNo': 'Guardian_Contact_No',
      'employmentStatus': 'Employment_Status'
    };

    return mapping[fieldName] || null;
  }
}

