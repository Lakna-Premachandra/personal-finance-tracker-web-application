// Types
import { api } from "../baseApi";

interface Jar {
  Jar_ID: number;
  User_ID: number;
  Target_Amount: number;
  Current_Amount: number;
  Level: number;
  Status: 'Active' | 'Completed' | 'Inactive';
  Created_Date: string;
  Updated_Date: string;
  Completion_Date: string | null;
  Action_Taken: string | null;
  Goal_ID: number | null;
  Expense_ID: number | null;
}

interface JarStats {
  totalJarsCompleted: number;
  totalAmountSaved: number;
  currentLevel: number;
  currentProgress: number;
}

interface JarHistory {
  Jar_ID: number;
  Level: number;
  Target_Amount: number;
  Completion_Date: string;
  Action_Taken: string | null;
  Goal_Title: string | null;
  Expense_Title: string | null;
  Amount: number;
}

interface GetCurrentJarResponse {
  success: boolean;
  data: {
    currentJar: Jar | null;
    stats: JarStats;
  };
}

interface AddMoneyToJarResponse {
  success: boolean;
  message: string;
  jarId: number;
  jarCompleted?: boolean;
  newLevel?: number;
}

interface GetJarHistoryResponse {
  success: boolean;
  data: JarHistory[];
}

interface TransferToGoalResponse {
  success: boolean;
  message: string;
  goalId: number;
}

interface MarkSpentResponse {
  success: boolean;
  message: string;
  expenseId: number;
}

interface GetJarStatsResponse {
  success: boolean;
  data: JarStats;
}

interface AddMoneyRequest {
  amount: number;
}

interface TransferToGoalRequest {
  goalId: number;
}

interface MarkSpentRequest {
  title: string;
  categoryId: number;
  description: string;
}



// Jar API with injected endpoints

const controller = 'jars';

export const jarApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentJar: builder.query<GetCurrentJarResponse, void>({
      query: () => ({
        url: controller,
        params: { stats: 'true' },
      }),
      providesTags: ['Jar', 'JarStats'],
    }),

    addMoneyToJar: builder.mutation<AddMoneyToJarResponse, AddMoneyRequest>({
      query: (body) => ({
        url: controller,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Jar', 'JarStats', 'JarHistory','Dashboard'],
    }),

    getJarHistory: builder.query<GetJarHistoryResponse, void>({
      query: () => `${controller}/history`,
      providesTags: ['JarHistory'],
    }),

    transferToGoal: builder.mutation<
      TransferToGoalResponse,
      { jarId: number } & TransferToGoalRequest
    >({
      query: ({ jarId, ...body }) => ({
        url: `${controller}/${jarId}/transfer-to-goal`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Jar', 'JarStats', 'JarHistory','Goal'],
    }),

    markJarSpent: builder.mutation<
      MarkSpentResponse,
      { jarId: number } & MarkSpentRequest
    >({
      query: ({ jarId, ...body }) => ({
        url: `${controller}/${jarId}/mark-spent`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Jar', 'JarStats', 'JarHistory'],
    }),

    getJarStats: builder.query<GetJarStatsResponse, void>({
      query: () => `${controller}/stats`,
      providesTags: ['JarStats'],
    }),
  }),
});

export const {
  useGetCurrentJarQuery,
  useAddMoneyToJarMutation,
  useGetJarHistoryQuery,
  useTransferToGoalMutation,
  useMarkJarSpentMutation,
  useGetJarStatsQuery,
} = jarApi;