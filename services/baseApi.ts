import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// Create a base query that includes the token
const baseQueryWithAuth = fetchBaseQuery({
  baseUrl: 'http://localhost:3000/api',
  prepareHeaders: (headers, { getState }) => {
    // Get token from localStorage or Redux state
    const token = sessionStorage.getItem('token')
    // Alternative: get from Redux state
    // const token = (getState() as RootState).auth.token

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    return headers
  },
})

export const api = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithAuth,
  tagTypes: ['User', 'Goal', 'Transaction', 'Budget', 'Category', 'MonthlySummary', 'Profile', 'CronStatus', 'ManualCheck', 'CronLogs', 'NotificationStats', 'UnprocessedNotifications', 'Notifications', 'UserNotifications', 'UserProfile', 'CronCheck', 'CronSchedule', 'Jar',
    'JarStats',
    'JarHistory',
    "Leaderboard",
    'PaymentReminder', 'PaymentReminderStats', 'PaymentNotification'], // Add more as needed
  endpoints: () => ({}),
})