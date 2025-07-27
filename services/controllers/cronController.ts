import { api } from "../baseApi"

const controller = 'cron'

export const cronApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/cron/status - Get cron service status
    getCronStatus: builder.query({
      query: () => ({
        url: `/${controller}/status`,
        method: 'GET',
      }),
      providesTags: ['CronStatus'],
    }),

    // GET /api/cron/manual-check - Trigger manual birthday check
    triggerManualCheck: builder.query({
      query: () => ({
        url: `/${controller}/manual-check`,
        method: 'GET',
      }),
      providesTags: ['CronCheck'],
    }),

    // POST /api/cron/startup - Start cron service
    startCronService: builder.mutation({
      query: () => ({
        url: `/${controller}/startup`,
        method: 'POST',
      }),
      invalidatesTags: ['CronStatus'],
    }),

    // Additional endpoints that might be useful for cron management
    
    // GET /api/cron/logs - Get cron execution logs (assumed endpoint)
    getCronLogs: builder.query({
      query: (params = {}) => ({
        url: `/${controller}/logs`,
        method: 'GET',
        params,
      }),
      providesTags: ['CronLogs'],
    }),

    // POST /api/cron/stop - Stop cron service (assumed endpoint)
    stopCronService: builder.mutation({
      query: () => ({
        url: `/${controller}/stop`,
        method: 'POST',
      }),
      invalidatesTags: ['CronStatus'],
    }),

    // POST /api/cron/restart - Restart cron service (assumed endpoint)
    restartCronService: builder.mutation({
      query: () => ({
        url: `/${controller}/restart`,
        method: 'POST',
      }),
      invalidatesTags: ['CronStatus', 'CronLogs'],
    }),

    // GET /api/cron/schedule - Get cron schedule configuration (assumed endpoint)
    getCronSchedule: builder.query({
      query: () => ({
        url: `/${controller}/schedule`,
        method: 'GET',
      }),
      providesTags: ['CronSchedule'],
    }),

    // PUT /api/cron/schedule - Update cron schedule (assumed endpoint)
    updateCronSchedule: builder.mutation({
      query: (scheduleData) => ({
        url: `/${controller}/schedule`,
        method: 'PUT',
        body: scheduleData,
      }),
      invalidatesTags: ['CronSchedule', 'CronStatus'],
    }),
  }),
  overrideExisting: false,
})

// Export hooks for use in components
export const {
  useGetCronStatusQuery,
  useTriggerManualCheckQuery,
  useStartCronServiceMutation,
  useGetCronLogsQuery,
  useStopCronServiceMutation,
  useRestartCronServiceMutation,
  useGetCronScheduleQuery,
  useUpdateCronScheduleMutation,
  
  // Lazy query hooks for manual triggering
  useLazyGetCronStatusQuery,
  useLazyTriggerManualCheckQuery,
  useLazyGetCronLogsQuery,
  useLazyGetCronScheduleQuery,
} = cronApi

// Export the reducer
export default cronApi