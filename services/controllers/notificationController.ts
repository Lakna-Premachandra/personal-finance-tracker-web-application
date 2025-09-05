import { api } from "../baseApi"

const controller = 'notifications'

// Interfaces based on your API responses
export interface Notification {
  Notification_ID: number
  User_ID?: number
  Notification_Date?: string
  Sent_Date?: string
  Is_Processed: boolean
  Age?: number
  Type?: string
  Message: string
  type: "Birthday" | "PaymentReminder"
  
  // Payment reminder specific fields
  Reminder_ID?: number
  Title?: string
  Due_Date?: string
  Amount?: number
  Created_At?: string
}

export interface GetUserNotificationsResponse {
  success: boolean
  data: Notification[]
  hasUnprocessedNotifications: boolean
}

export interface ProcessNotificationRequest {
  userId: number
  notificationId: number
  userTypeChoice?: string // Optional for payment reminders
}

export interface ProcessNotificationResponse {
  success: boolean
  message: string
  notificationProcessed: boolean
  notificationType: "birthday" | "payment_reminder"
  
  // Birthday notification specific fields
  transitionCompleted?: boolean
  newUserType?: string
  transitionMessage?: string
  currentUserType?: string
  currentAge?: number
  
  // Payment reminder specific fields
  rowsAffected?: number
}

export interface TransformedUserNotifications {
  notifications: Notification[]
  hasUnprocessedNotifications: boolean
  success: boolean
}

export interface NotificationStats {
  totalNotifications: number
  processedNotifications: number
  unprocessedNotifications: number
  transitionsToday: number
}

export interface MarkAsReadRequest {
  userId: number
  notificationIds: number[]
}

export const notificationsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // GET /api/notifications/:userId - Get user notifications
    getUserNotifications: builder.query<TransformedUserNotifications, number>({
      query: (userId) => ({
        url: `/${controller}/${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [
        { type: 'UserNotifications', id: userId },
        'Notifications',
      ],
      transformResponse: (response: GetUserNotificationsResponse): TransformedUserNotifications => ({
        notifications: response.data || [],
        hasUnprocessedNotifications: response.hasUnprocessedNotifications || false,
        success: response.success,
      }),
    }),

    // PUT /api/notifications/:userId - Process notification and handle user type transition
    processNotification: builder.mutation<ProcessNotificationResponse, ProcessNotificationRequest>({
      query: ({ userId, notificationId, userTypeChoice }) => ({
        url: `/${controller}/${userId}`,
        method: 'PUT',
        body: {
          notificationId,
          userTypeChoice,
        },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'UserNotifications', id: userId },
        'Notifications',
        'UserProfile', // In case user profile needs to be updated
      ],
      transformResponse: (response: ProcessNotificationResponse): ProcessNotificationResponse => ({
        success: response.success,
        message: response.message,
        notificationProcessed: response.notificationProcessed,
        transitionCompleted: response.transitionCompleted,
        newUserType: response.newUserType,
        transitionMessage: response.transitionMessage,
        currentUserType: response.currentUserType,
        currentAge: response.currentAge,
        notificationType: "birthday"
      }),
    }),

    // Additional useful endpoints you might need

    // GET /api/notifications - Get all notifications (admin view)
    getAllNotifications: builder.query<Notification[], { page?: number; limit?: number; status?: string }>({
      query: (params = {}) => ({
        url: `/${controller}`,
        method: 'GET',
        params,
      }),
      providesTags: ['Notifications'],
    }),

    // DELETE /api/notifications/:notificationId - Delete specific notification
    deleteNotification: builder.mutation<{ success: boolean; message: string }, number>({
      query: (notificationId) => ({
        url: `/${controller}/${notificationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notifications'],
    }),

    // GET /api/notifications/unprocessed - Get all unprocessed notifications
    getUnprocessedNotifications: builder.query<Notification[], void>({
      query: () => ({
        url: `/${controller}/unprocessed`,
        method: 'GET',
      }),
      providesTags: ['UnprocessedNotifications'],
    }),

    // POST /api/notifications/mark-read/:userId - Mark notifications as read
    markNotificationsAsRead: builder.mutation<{ success: boolean; message: string }, MarkAsReadRequest>({
      query: ({ userId, notificationIds }) => ({
        url: `/${controller}/mark-read/${userId}`,
        method: 'POST',
        body: { notificationIds },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'UserNotifications', id: userId },
        'Notifications',
      ],
    }),

    // GET /api/notifications/stats - Get notification statistics
    getNotificationStats: builder.query<NotificationStats, void>({
      query: () => ({
        url: `/${controller}/stats`,
        method: 'GET',
      }),
      providesTags: ['NotificationStats'],
    }),
  }),
  overrideExisting: false,
})

// Export hooks for usage in functional components
export const {
  useGetUserNotificationsQuery,
  useLazyGetUserNotificationsQuery,
  useProcessNotificationMutation,
  useGetAllNotificationsQuery,
  useLazyGetAllNotificationsQuery,
  useDeleteNotificationMutation,
  useGetUnprocessedNotificationsQuery,
  useLazyGetUnprocessedNotificationsQuery,
  useMarkNotificationsAsReadMutation,
  useGetNotificationStatsQuery,
  useLazyGetNotificationStatsQuery,
} = notificationsApi

// Export endpoints for advanced usage
export const {
  getUserNotifications,
  processNotification,
  getAllNotifications,
  deleteNotification,
  getUnprocessedNotifications,
  markNotificationsAsRead,
  getNotificationStats,
} = notificationsApi.endpoints

// Custom selectors for easier data access
export const selectUserNotificationData = (state: any, userId: number): TransformedUserNotifications | undefined => {
  const result = notificationsApi.endpoints.getUserNotifications.select(userId)(state)
  return result.data
}

export const selectHasUnprocessedNotifications = (state: any, userId: number): boolean => {
  const result = notificationsApi.endpoints.getUserNotifications.select(userId)(state)
  return result.data?.hasUnprocessedNotifications || false
}

// Type guard functions
export const isAgeTransitionNotification = (notification: Notification): boolean => {
  return notification.Message.includes('turned 18') || notification.Message.includes('upgrade')
}

export const getUserTypeFromNotification = (notification: Notification): string | null => {
  if (notification.Type === 'Student' && notification?.Age! >= 18) {
    return 'Young-Adult'
  }
  return null
}