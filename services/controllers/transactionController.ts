import { api } from "../baseApi";

export interface Transaction {
    Transaction_ID: number
    User_ID: number
    Title: string
    Description: string
    Amount: number
    Category_ID: number
    Category_Name: string
    Type: 'Income' | 'Expense'
    Transaction_Date: string
}

export interface CreateTransactionRequest {
    title: string
    description: string
    amount: number
    type: 'Income' | 'Expense'
    categoryId?: number // Optional for Income, Required for Expense
    transactionDate?: string // Optional for Income, Required for Expense
}

export interface UpdateTransactionRequest {
    title: string
    description: string
    amount: number
    type: 'Income' | 'Expense'
    categoryId?: number // Optional for Income, Required for Expense
    transactionDate?: string // Optional for Income, Required for Expense
}

export interface TransactionResponse {
    success: boolean
    data: Transaction[]
    summary: {
        totalIncome: number
        totalExpenses: number
        totalGoalAllocations: number
        netBalance: number
    }
}

export interface SingleTransactionResponse {
    success: boolean
    data: Transaction
}

export interface CreateTransactionResponse {
    success: boolean
    message: string
    data: {
        transactionId: number
    }
}

export interface UpdateTransactionResponse {
    success: boolean
    message: string
}

export interface DeleteTransactionResponse {
    success: boolean
    message: string
}
export interface BudgetStatus {
    Budget_ID: number
    User_ID: number
    Category_ID: number
    Amount: number
    Year: number
    Month: number
    Created_Date: string
    Updated_Date: string
    Category_Name: string
    Category_Type: string
    Budget_Amount: number
    Spent_Amount: number
    Remaining_Amount: number
    Percentage_Used: number
    Status: string
}

export interface BudgetStatusResponse {
    success: boolean
    data: BudgetStatus[]
}

export interface BudgetStatusParams {
    year: number
    month: number
}
export type TransactionType = 'Income' | 'Expense'

// Inject transaction endpoints
export const transactionApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // GET ALL transactions
        getTransactions: builder.query<TransactionResponse, void>({
            query: () => '/transactions',
            providesTags: ['Transaction', 'Category'],
        }),

        // GET transactions by type
        getTransactionsByType: builder.query<TransactionResponse, TransactionType>({
            query: (type) => `/transactions?type=${type}`,
            providesTags: (result, error, type) => [
                { type: 'Transaction', id: `TYPE_${type}` },
            ],
        }),

        // GET transaction by ID
        getTransactionById: builder.query<SingleTransactionResponse, { id: number; type: TransactionType }>({
            query: ({ id, type }) => `/transactions/${id}?type=${type}`,
            providesTags: (result, error, { id }) => [
                { type: 'Transaction', id },
            ],
        }),

        // POST - Create new transaction
        createTransaction: builder.mutation<CreateTransactionResponse, CreateTransactionRequest>({
            query: (transaction) => ({
                url: '/transactions',
                method: 'POST',
                body: transaction,
            }),
            invalidatesTags: ['Transaction'],
        }),

        // PUT - Update transaction
        updateTransaction: builder.mutation<UpdateTransactionResponse, { id: number; transaction: UpdateTransactionRequest }>({
            query: ({ id, transaction }) => ({
                url: `/transactions/${id}`,
                method: 'PUT',
                body: transaction,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Transaction', id },
                'Transaction',
            ],
        }),

        // DELETE transaction - Fixed the type parameter
        deleteTransaction: builder.mutation<DeleteTransactionResponse, {
            id: number;
            type: TransactionType;
            categoryId?: number;
            transactionDate?: string;
        }>({
            query: ({ id, type, categoryId, transactionDate }) => {
                let url = `/transactions/${id}?type=${type}`;

                // Add categoryId and transactionDate for expenses
                if (type === 'Expense' && categoryId && transactionDate) {
                    url += `&categoryId=${categoryId}&transactionDate=${transactionDate}`;
                }

                return {
                    url,
                    method: 'DELETE',
                };
            },
            invalidatesTags: (result, error, { id }) => [
                { type: 'Transaction', id },
                'Transaction',
            ],
        }),
        getBudgetStatus: builder.query<BudgetStatusResponse, BudgetStatusParams>({
            query: ({ year, month }) => `/budgets/status?year=${year}&month=${month}`,
            providesTags: (result, error, { year, month }) => [
                { type: 'Budget', id: `${year}_${month}` },
            ],
        }),
    }),
})

// Export hooks for usage in functional components
export const {
    useGetTransactionsQuery,
    useGetTransactionsByTypeQuery,
    useGetTransactionByIdQuery,
    useCreateTransactionMutation,
    useUpdateTransactionMutation,
    useDeleteTransactionMutation,
    useGetBudgetStatusQuery,
} = transactionApi