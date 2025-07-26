// lib/utils/fileUpload.ts
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';

export interface FileUploadResult {
  success: boolean;
  filePath?: string;
  error?: string;
}

export class FileUploadService {
  private static readonly UPLOAD_DIR = './public/uploads/profile-pictures';
  private static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  static async ensureUploadDir(): Promise<void> {
    if (!existsSync(this.UPLOAD_DIR)) {
      await mkdir(this.UPLOAD_DIR, { recursive: true });
    }
  }

  static validateFile(file: File): { isValid: boolean; error?: string } {
    if (file.size > this.MAX_FILE_SIZE) {
      return { isValid: false, error: 'File size must be less than 5MB' };
    }

    if (!this.ALLOWED_TYPES.includes(file.type)) {
      return { isValid: false, error: 'Only JPEG, PNG, and WebP images are allowed' };
    }

    return { isValid: true };
  }

  static generateFileName(originalName: string, userId: number): string {
    const extension = path.extname(originalName);
    const timestamp = Date.now();
    return `user_${userId}_${timestamp}${extension}`;
  }

  static async uploadProfilePicture(file: File, userId: number): Promise<FileUploadResult> {
    try {
      const validation = this.validateFile(file);
      if (!validation.isValid) {
        return { success: false, error: validation.error };
      }

      await this.ensureUploadDir();

      const fileName = this.generateFileName(file.name, userId);
      const filePath = path.join(this.UPLOAD_DIR, fileName);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      await writeFile(filePath, buffer);

      const relativePath = `/uploads/profile-pictures/${fileName}`;
      
      return { 
        success: true, 
        filePath: relativePath 
      };

    } catch (error) {
      console.error('Error uploading file:', error);
      return { 
        success: false, 
        error: 'Failed to upload file' 
      };
    }
  }

  static async deleteOldProfilePicture(oldFilePath: string | null): Promise<void> {
    if (!oldFilePath) return;

    try {
      const fs = await import('fs/promises');
      const fullPath = path.join('./public', oldFilePath);
      
      if (existsSync(fullPath)) {
        await fs.unlink(fullPath);
      }
    } catch (error) {
      console.error('Error deleting old profile picture:', error);
    }
  }
}
