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
    categoryId: number
    type: 'Income' | 'Expense'
}

export interface UpdateTransactionRequest {
    title: string
    description: string
    amount: number
    categoryId: number
    type: 'Income' | 'Expense'
}

export interface TransactionResponse {
    success: boolean
    data: Transaction[]
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

export type TransactionType = 'Income' | 'Expense'

// Inject transaction endpoints
export const transactionApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // GET ALL transactions
        getTransactions: builder.query<TransactionResponse, void>({
            query: () => '/transactions',
            providesTags: ['Transaction'],
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

        // DELETE transaction
        deleteTransaction: builder.mutation<DeleteTransactionResponse, { id: number; type: TransactionType }>({
            query: ({ id, type }) => ({
                url: `/transactions/${id}?type=${type}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Transaction', id },
                'Transaction',
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
} = transactionApi
