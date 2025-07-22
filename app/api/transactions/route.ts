import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '@/lib/services/transactionService';
import { verifyToken } from '@/lib/utils/auth';

// GET: Get all transactions or by type
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'Income' | 'Expense' | null;

    const transactions = await TransactionService.getAllTransactions(user.userId, type || undefined);

    return NextResponse.json({
      success: true,
      data: transactions
    });

  } catch (error) {
    console.error('Error in GET /api/transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Add new transaction
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
    const { title, description, amount, categoryId, type, transactionDate } = body;

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

    let result;
    if (type === 'Income') {
      result = await TransactionService.addIncomeTransaction(user.userId, transactionInput);
    } else {
      result = await TransactionService.addExpenseTransaction(user.userId, transactionInput);
    }

    if (result.Status === 'ERROR') {
      return NextResponse.json(
        { error: result.Message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.Message,
      data: { 
        transactionId: result.Transaction_ID,
        budgetStatus: 'budgetStatus' in result ? result.budgetStatus : undefined
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Error in POST /api/transactions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
