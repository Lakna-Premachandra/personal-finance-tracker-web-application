import { connectToDatabase, sql } from '@/lib/database/db';

export interface Category {
  Category_ID: number;
  User_ID: number | null;
  Name: string;
  Type: 'Income' | 'Expense';
  Is_Default: boolean;
  Created_Date: Date;
  Updated_Date: Date;
}

export interface CategoryResponse {
  Status: 'SUCCESS' | 'ERROR';
  Message: string;
  Category_ID?: number;
}

export class CategoryService {
  static async getAllCategories(userId: number): Promise<Category[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .execute('GetAllCategories');
      
      return result.recordset.map((row: any) => ({
        Category_ID: row.Category_ID,
        User_ID: row.User_ID,
        Name: row.Name,
        Type: row.Type,
        Is_Default: row.Is_Default,
        Created_Date: row.Created_Date,
        Updated_Date: row.Updated_Date
      }));
    } catch (error) {
      console.error('Error getting all categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }

  static async getCategoriesByType(userId: number, type: 'Income' | 'Expense'): Promise<Category[]> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Type', sql.NVarChar(20), type)
        .execute('GetCategoriesByType');
      
      return result.recordset.map((row: any) => ({
        Category_ID: row.Category_ID,
        User_ID: row.User_ID,
        Name: row.Name,
        Type: row.Type,
        Is_Default: row.Is_Default,
        Created_Date: row.Created_Date,
        Updated_Date: row.Updated_Date
      }));
    } catch (error) {
      console.error('Error getting categories by type:', error);
      throw new Error('Failed to fetch categories by type');
    }
  }

  static async addCategory(userId: number, name: string, type: 'Income' | 'Expense'): Promise<CategoryResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('UserID', sql.Int, userId)
        .input('Name', sql.NVarChar(50), name)
        .input('Type', sql.NVarChar(20), type)
        .execute('AddCategory');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message,
        Category_ID: response.Category_ID
      };
    } catch (error) {
      console.error('Error adding category:', error);
      throw new Error('Failed to add category');
    }
  }

  static async updateCategory(categoryId: number, userId: number, name: string, type: 'Income' | 'Expense'): Promise<CategoryResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('CategoryID', sql.Int, categoryId)
        .input('UserID', sql.Int, userId)
        .input('Name', sql.NVarChar(50), name)
        .input('Type', sql.NVarChar(20), type)
        .execute('UpdateCategory');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message
      };
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  static async deleteCategory(categoryId: number, userId: number): Promise<CategoryResponse> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('CategoryID', sql.Int, categoryId)
        .input('UserID', sql.Int, userId)
        .execute('DeleteCategory');
      
      const response = result.recordset[0];
      return {
        Status: response.Status,
        Message: response.Message
      };
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  static async getCategoryById(categoryId: number, userId: number): Promise<Category | null> {
    try {
      const pool = await connectToDatabase();
      const result = await pool.request()
        .input('CategoryID', sql.Int, categoryId)
        .input('UserID', sql.Int, userId)
        .execute('GetCategoryById');
  
      const row = result.recordset[0];
      if (!row) return null;
  
      return {
        Category_ID: row.Category_ID,
        User_ID: row.User_ID,
        Name: row.Name,
        Type: row.Type,
        Is_Default: row.Is_Default,
        Created_Date: row.Created_Date,
        Updated_Date: row.Updated_Date
      };
    } catch (error) {
      console.error('Error getting category by ID:', error);
      throw new Error('Failed to fetch category');
    }
  }  
}
