import { api } from "../baseApi";

export interface Goal {
    Goal_ID: number;
    User_ID: number;
    Title: string;
    Description: string;
    Target_Amount: number;
    Current_Amount: number;
    Start_Date: string;
    Target_Date: string;
    Category_Name: string;
    CategoryId: number;
    Status: 'Active' | 'Completed' | 'Overdue' | 'Achieved';
    Created_Date: string;
    Updated_Date: string;
    Days_Left: number;
    Remaining_Amount: number;
    Completion_Percentage: number;
    Daily_Saving_Required: number;

}

export interface MarkSpentResponse {
    success: boolean;
    message: string;
    data: {
        expenseId: number;
    };
}

export interface CreateGoalRequest {
    title: string;
    description: string;
    targetAmount: number;
    targetDate: string;
    categoryId: number;
    startDate: string;
}

export interface UpdateGoalRequest {
    title: string;
    description: string;
    targetAmount: number;
    targetDate: string | undefined | Date;
    categoryId: number;
    status: 'Active' | 'Completed' | 'Overdue' | 'Achieved';
}

export interface ContributeRequest {
    amount: number;
}

export interface GoalsResponse {
    success: boolean;
    data: Goal[];
    summary: {
        activeGoals: number;
        completedGoals: number;
        totalSaved: number;
        totalTargetAmount: number;
    };
}

export interface GoalResponse {
    success: boolean;
    data: Goal;
}

export interface CreateGoalResponse {
    success: boolean;
    message: string;
    data: {
        goalId: number;
    };
}

export interface UpdateGoalResponse {
    success: boolean;
    message: string;
}

export interface DeleteGoalResponse {
    success: boolean;
    message: string;
}

export interface ContributeResponse {
    success: boolean;
    message: string;
}



export const goalsApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // GET /api/goals
        getGoals: builder.query<GoalsResponse, void>({
            query: () => ({
                url: 'goals',
                method: 'GET',
            }),
            providesTags: ['Goal'],
        }),

        // GET /api/goals/[id]
        getGoalById: builder.query<GoalResponse, number>({
            query: (id) => ({
                url: `goals/${id}`,
                method: 'GET',
            }),
            providesTags: (result, error, id) => [{ type: 'Goal', id }],
        }),

        // POST /api/goals
        createGoal: builder.mutation<CreateGoalResponse, CreateGoalRequest>({
            query: (goalData) => ({
                url: 'goals',
                method: 'POST',
                body: goalData,
            }),
            invalidatesTags: ['Goal'],
        }),

        // PUT /api/goals/[id]
        updateGoal: builder.mutation<UpdateGoalResponse, { id: number; data: UpdateGoalRequest }>({
            query: ({ id, data }) => ({
                url: `goals/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Goal', id }, 'Goal'],
        }),

        // DELETE /api/goals/[id]
        deleteGoal: builder.mutation<DeleteGoalResponse, number>({
            query: (id) => ({
                url: `goals/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Goal'],
        }),

        // POST /api/goals/[id]/contribute
        contributeToGoal: builder.mutation<ContributeResponse, { id: number; data: ContributeRequest }>({
            query: ({ id, data }) => ({
                url: `goals/${id}/contribute`,
                method: 'POST',
                body: data,
            }),
            invalidatesTags: (result, error, { id }) => [{ type: 'Goal', id }, 'Goal','Dashboard'],
        }),
        // POST /api/goals/[id]/mark-spent
        markGoalAsSpent: builder.mutation<MarkSpentResponse, number>({
            query: (id) => ({
                url: `goals/${id}/mark-spent`,
                method: 'POST',
            }),
            invalidatesTags: (result, error, id) => [{ type: 'Goal', id }, 'Goal'],
        }),
    }),
});

export const {
    useGetGoalsQuery,
    useGetGoalByIdQuery,
    useCreateGoalMutation,
    useUpdateGoalMutation,
    useDeleteGoalMutation,
    useContributeToGoalMutation,
    useMarkGoalAsSpentMutation,
} = goalsApi;