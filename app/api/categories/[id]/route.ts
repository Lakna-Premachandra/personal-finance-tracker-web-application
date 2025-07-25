import { NextRequest, NextResponse } from 'next/server';
import { CategoryService } from '@/lib/services/categoryService';
import { verifyToken } from '@/lib/utils/auth';

// PUT: Update category
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

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, type } = body;

    if (!name || !type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    if (!['Income', 'Expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either Income or Expense' },
        { status: 400 }
      );
    }

    const result = await CategoryService.updateCategory(categoryId, user.userId, name, type);

    if (result.Status === 'ERROR') {
      return NextResponse.json(
        { error: result.Message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.Message
    });

  } catch (error) {
    console.error('Error in PUT /api/categories/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete category with transaction reassignment and budget deletion
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

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json(
        { error: 'Invalid category ID' },
        { status: 400 }
      );
    }

    const result = await CategoryService.deleteCategory(categoryId, user.userId);

    if (result.Status === 'ERROR') {
      return NextResponse.json(
        { error: result.Message },
        { status: 400 }
      );
    }

    const response: any = {
      success: true,
      message: result.Message
    };

    // Add detailed information about what was deleted/reassigned
    const details = [];
    
    if (result.BudgetsDeleted && result.BudgetsDeleted > 0) {
      response.budgetsDeleted = result.BudgetsDeleted;
      details.push(`${result.BudgetsDeleted} budget(s) were deleted`);
    }

    if (result.TransactionsReassigned && result.TransactionsReassigned > 0) {
      response.transactionsReassigned = result.TransactionsReassigned;
      details.push(`${result.TransactionsReassigned} transaction(s) were moved to the default category`);
    }

    if (details.length > 0) {
      response.details = details.join(', ');
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in DELETE /api/categories/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Get category by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const categoryId = parseInt(params.id);
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'Invalid category ID' }, { status: 400 });
    }

    const category = await CategoryService.getCategoryById(categoryId, user.userId);

    if (!category) {
      return NextResponse.json({ error: 'Category not found or access denied' }, { status: 404 });
    }

    // Include transaction count in the response
    let transactionCount = { incomeCount: 0, expenseCount: 0 };
    try {
      transactionCount = await CategoryService.getCategoryTransactionCount(categoryId, user.userId);
    } catch (error) {
      console.warn('Could not get transaction count:', error);
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...category,
        transactionCount
      }
    });
  } catch (error) {
    console.error('Error in GET /api/categories/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
