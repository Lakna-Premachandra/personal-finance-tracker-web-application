// Types for leaderboard API responses and requests
export interface LeaderboardEntry {
  User_ID: number;
  Username: string;
  Rank: number;
  Goals_Completed: number;
  Total_Goals: number;
  Goal_Completion_Rate: number;
  Jar_Level: number;
  Score: number;
  Badge_Title: string;
  Created_Date: string;
  Updated_Date: string;
  ProfilePicture?: string;
}

export interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardEntry[];
}

export interface EligibilityData {
  User_ID: number;
  Username: string;
  Is_Eligible: boolean;
  Goals_Completed: number;
  Goals_Required: number;
  Jar_Level: number;
  Jar_Level_Required: number;
  Progress_Message: string;
}

export interface EligibilityResponse {
  success: boolean;
  data: EligibilityData;
}

export interface StatsData {
  Total_Students: number;
  Eligible_Students: number;
  Your_Rank: number;
  Top_Score: number;
  Average_Score: number;
}

export interface StatsResponse {
  success: boolean;
  data: StatsData;
}

export interface PositionResponse {
  success: boolean;
  data: LeaderboardEntry;
}

export interface RefreshRequest {
  action: "refresh";
}

export interface RefreshResponse {
  success: boolean;
  message: string;
}

// Query parameters for different actions
export type LeaderboardAction = "eligibility" | "stats" | "position";

export interface LeaderboardQueryParams {
  action?: LeaderboardAction;
}

// RTK Query implementation
import { api } from "../baseApi";

const controller = 'leaderboard';

export const leaderboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET api/leaderboard - Get leaderboard data
    getLeaderboard: builder.query<LeaderboardResponse, void>({
      query: () => ({
        url: `${controller}`,
        method: 'GET',
      }),
      providesTags: ['Leaderboard'],
    }),

    // GET api/leaderboard?action=eligibility - Check eligibility
    getEligibility: builder.query<EligibilityResponse, void>({
      query: () => ({
        url: `${controller}`,
        method: 'GET',
        params: { action: 'eligibility' },
      }),
      providesTags: ['Leaderboard'],
    }),

    // GET api/leaderboard?action=stats - Get leaderboard statistics
    getStats: builder.query<StatsResponse, void>({
      query: () => ({
        url: `${controller}`,
        method: 'GET',
        params: { action: 'stats' },
      }),
      providesTags: ['Leaderboard'],
    }),

    // GET api/leaderboard?action=position - Get user position
    getPosition: builder.query<PositionResponse, void>({
      query: () => ({
        url: `${controller}`,
        method: 'GET',
        params: { action: 'position' },
      }),
      providesTags: ['Leaderboard'],
    }),

    // POST api/leaderboard - Refresh leaderboard (cron job)
    refreshLeaderboard: builder.mutation<RefreshResponse, RefreshRequest>({
      query: (body) => ({
        url: `${controller}`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Leaderboard'],
    }),

    // Generic query with action parameter (alternative approach)
    getLeaderboardWithAction: builder.query<
      LeaderboardResponse | EligibilityResponse | StatsResponse | PositionResponse,
      LeaderboardQueryParams
    >({
      query: (params = {}) => ({
        url: `${controller}`,
        method: 'GET',
        params,
      }),
      providesTags: ['Leaderboard'],
    }),
  }),
});

// Export hooks for use in components
export const {
  useGetLeaderboardQuery,
  useGetEligibilityQuery,
  useGetStatsQuery,
  useGetPositionQuery,
  useRefreshLeaderboardMutation,
  useGetLeaderboardWithActionQuery,
} = leaderboardApi;

// Export the reducer
export default leaderboardApi;