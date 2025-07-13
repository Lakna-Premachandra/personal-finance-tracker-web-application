import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '@/lib/services/transactionService';
import { verifyToken } from '@/lib/utils/auth';

// GET: Get transaction by ID
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

    const transactionId = parseInt(params.id);
    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'Income' | 'Expense';

    if (!type || !['Income', 'Expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type parameter is required and must be either Income or Expense' },
        { status: 400 }
      );
    }

    const transaction = await TransactionService.getTransactionById(transactionId, type, user.userId);

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Error in GET /api/transactions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update transaction
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

    const transactionId = parseInt(params.id);
    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { title, description, amount, categoryId, type, transactionDate  } = body;

    // Validate input
    if (!title || !amount || !categoryId || !type) {
      return NextResponse.json(
        { error: 'Title, amount, categoryId, and type are required' },
        { status: 400 }
      );
    }

    if (!['Income', 'Expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either Income or Expense' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Validate transaction date if provided
    if (transactionDate) {
      const parsedDate = new Date(transactionDate);
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { error: 'Invalid transaction date format' },
          { status: 400 }
        );
      }
      
      // Check if transaction date is not in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate > today) {
        return NextResponse.json(
          { error: 'Transaction date cannot be in the future' },
          { status: 400 }
        );
      }
    }

    const transactionInput = {
      title,
      description: description || '',
      amount: parseFloat(amount),
      categoryId: parseInt(categoryId),
      transactionDate: transactionDate || undefined
    };

    const result = await TransactionService.updateTransaction(transactionId, user.userId, type, transactionInput);

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
    console.error('Error in PUT /api/transactions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE: Delete transaction
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

    const transactionId = parseInt(params.id);
    if (isNaN(transactionId)) {
      return NextResponse.json(
        { error: 'Invalid transaction ID' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'Income' | 'Expense';

    if (!type || !['Income', 'Expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Type parameter is required and must be either Income or Expense' },
        { status: 400 }
      );
    }

    const result = await TransactionService.deleteTransaction(transactionId, user.userId, type);

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
    console.error('Error in DELETE /api/transactions/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
