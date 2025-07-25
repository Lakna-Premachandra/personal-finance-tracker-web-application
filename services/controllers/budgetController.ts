import { api } from "../baseApi"

const controller = 'budgets'

// Request Interfaces
export interface CreateBudgetRequest {
  categoryId: number
  amount: number
  year: number
  month: number
}

export interface UpdateBudgetRequest {
  budgetId: number
  categoryId: number
  amount: number
  year: number
  month: number
}

export interface GetBudgetsByYearMonthRequest {
  year: number
  month: number
}

export interface GetMonthlySummaryRequest {
  year: number
  month: number
}

// Response Interfaces
export interface CreateBudgetResponse {
  success: boolean
  message: string
  data: {
    budgetId: number
  }
}

export interface BudgetData {
  Budget_ID: number
  User_ID: number
  Category_ID: number
  Amount: number
  Year: number
  Month: number
  Created_Date: string
  Updated_Date: string
  CategoryName: string
  CategoryType: string
  Status?: string // Added to track budget status
}

export interface GetBudgetByIdResponse {
  success: boolean
  data: BudgetData
}

export interface GetBudgetsByYearMonthResponse {
  success: boolean
  data: BudgetData[]
}

export interface UpdateBudgetResponse {
  success: boolean
  message: string
}

export interface DeleteBudgetResponse {
  success: boolean
  message: string
}

export interface CategoryBreakdown {
  categoryId: number
  categoryName: string
  totalSpent: number
  budgetAmount: number
  remainingBudget: number
  percentageUsed: number
  status: string
  budgetId: number // Added budgetId to track the budget associated with the category
}

export interface BudgetSummary {
  totalBudget: number
  totalSpent: number
  remaining: number
  budgetCount: number
  overBudgetCount: number
  overallPercentageUsed: number
}

export interface MonthlySummaryData {
  year: number
  month: number
  summary: {
    totalIncome: number
    totalExpenses: number
    netAmount: number
    budgetSummary: BudgetSummary
    categoryBreakdown: CategoryBreakdown[]
  }
}

export interface GetMonthlySummaryResponse {
  success: boolean
  data: MonthlySummaryData
}

export const budgetsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // POST - Create budget
    createBudget: builder.mutation<CreateBudgetResponse, CreateBudgetRequest>({
      query: (budgetData) => ({
        url: `/${controller}`,
        method: 'POST',
        body: budgetData,
      }),
      invalidatesTags: ['Budget'],
    }),

    // GET BY ID - Get budget by ID
    getBudgetById: builder.query<GetBudgetByIdResponse, number>({
      query: (budgetId) => `/${controller}/${budgetId}`,
      providesTags: (result, error, budgetId) => [
        { type: 'Budget', id: budgetId }
      ],
    }),

    // GET BY YEAR & MONTH - Get budgets by year and month


    // PUT - Update budget
    updateBudget: builder.mutation<UpdateBudgetResponse, UpdateBudgetRequest>({
      query: ({ budgetId, ...budgetData }) => ({
        url: `/${controller}/${budgetId}`,
        method: 'PUT',
        body: budgetData,
      }),
      invalidatesTags: (result, error, { budgetId }) => [
        { type: 'Budget', id: budgetId },
        'Budget'
      ],
    }),

    // DELETE - Delete budget
    deleteBudget: builder.mutation<DeleteBudgetResponse, number>({
      query: (budgetId) => ({
        url: `/${controller}/${budgetId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, budgetId) => [
        { type: 'Budget', id: budgetId },
        'Budget'
      ],
    }),

    // GET - Monthly summary
    getMonthlySummary: builder.query<GetMonthlySummaryResponse, GetMonthlySummaryRequest>({
      query: ({ year, month }) => ({
        url: `/${controller}/monthly-summary`,
        params: { year, month },
      }),
      providesTags: (result, error, { year, month }) => [
        { type: 'MonthlySummary', id: `${year}-${month}` }
      ],
    }),
  }),
  overrideExisting: false,
})

export const {
  useCreateBudgetMutation,
  useGetBudgetByIdQuery,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
  useGetMonthlySummaryQuery,
} = budgetsApi