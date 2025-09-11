import { api } from "../baseApi";

const controller = 'payment-reminders';

// Types
export interface PaymentReminder {
  Reminder_ID: number;
  Title: string;
  Amount: number;
  Category: string;
  Due_Date: string;
  Next_Due_Date: string;
  Remind_Days_Before: number;
  Frequency: 'monthly' | 'quarterly' | 'weekly' | 'yearly';
  Is_Enabled: boolean;
  Last_Payment_Date: string | null;
  Status: 'upcoming' | 'overdue' | 'complete' | 'scheduled';
  DaysCount: number | null;
  Created_At: string;
  Updated_At: string;
}

export interface CreatePaymentReminderRequest {
  title: string;
  amount: number;
  category: string;
  dueDate: string;
  remindDaysBefore: 1 | 3 | 5 | 7;
  frequency: 'monthly' | 'quarterly' | 'weekly' | 'yearly';
  isEnabled: boolean;
}

export interface CreatePaymentReminderResponse {
  success: boolean;
  message: string;
  reminderId: number;
}

export interface GetPaymentRemindersResponse {
  success: boolean;
  data: PaymentReminder[];
}

export interface UpdatePaymentReminderRequest {
  title: string;
  amount: number;
  category: string;
  dueDate: string;
  remindDaysBefore: 1 | 3 | 5 | 7;
  frequency: 'monthly' | 'quarterly' | 'weekly' | 'yearly';
  isEnabled: boolean;
}

export interface UpdatePaymentReminderResponse {
  success: boolean;
  message: string;
}

export interface GetPaymentReminderByIdResponse {
  success: boolean;
  data: PaymentReminder;
}

export interface DeletePaymentReminderResponse {
  success: boolean;
  message: string;
}

export interface MarkPaidRequest {
  paymentDate: string;
  description: string;
}

export interface MarkPaidResponse {
  success: boolean;
  message: string;
  expenseId: number;
  nextDueDate: string;
}

export interface PaymentReminderStats {
  activeReminders: number;
  upcomingReminders: number;
  overdueReminders: number;
  totalAmount: number;
}

export interface GetStatsResponse {
  success: boolean;
  data: PaymentReminderStats;
}

export interface TestEmailRequest {
  testSecret: string;
  recipientEmail: string;
  testType: string;
}

export interface TestEmailResponse {
  success: boolean;
  message: string;
  messageId: string;
}

export interface CheckReminderResult {
  Reminder_ID: number;
  User_ID: number;
  Title: string;
  Amount: number;
  Category: string;
  Next_Due_Date: string;
  Remind_Days_Before: number;
  Username: string;
  Email: string;
  DaysUntilDue: number;
}

export interface CheckRemindersResponse {
  success: boolean;
  message: string;
  result: {
    count: number;
    reminders: CheckReminderResult[];
  };
}

export interface PaymentNotification {
  Notification_ID: number;
  Reminder_ID: number;
  Title: string;
  Message: string;
  Due_Date: string;
  Amount: number;
  Is_Processed: boolean;  
  Created_At: string;
  Category: string;
}

export interface GetNotificationsResponse {
  success: boolean;
  notifications: PaymentNotification[];
  hasUnprocessed: boolean;
}

export interface ProcessNotificationResponse {
  success: boolean;
  message: string;
}

// RTK Query API slice
export const paymentRemindersApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Create payment reminder
    createPaymentReminder: builder.mutation<CreatePaymentReminderResponse, CreatePaymentReminderRequest>({
      query: (data) => ({
        url: `${controller}`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PaymentReminder','UserNotifications','Notifications',"CronCheck",'Dashboard'],
    }),

    // Get all payment reminders
    getPaymentReminders: builder.query<GetPaymentRemindersResponse, void>({
      query: () => `${controller}`,
      providesTags: ['PaymentReminder'],
    }),

    // Get payment reminder by ID
    getPaymentReminderById: builder.query<GetPaymentReminderByIdResponse, number>({
      query: (id) => `${controller}/${id}`,
      providesTags: (result, error, id) => [{ type: 'PaymentReminder', id }],
    }),

    // Update payment reminder
    updatePaymentReminder: builder.mutation<
      UpdatePaymentReminderResponse,
      { id: number; data: UpdatePaymentReminderRequest }
    >({
      query: ({ id, data }) => ({
        url: `${controller}/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PaymentReminder', id },
        'PaymentReminder',
      ],
    }),

    // Delete payment reminder
    deletePaymentReminder: builder.mutation<DeletePaymentReminderResponse, number>({
      query: (id) => ({
        url: `${controller}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PaymentReminder'],
    }),

    // Mark payment as paid
    markPaymentPaid: builder.mutation<
      MarkPaidResponse,
      { id: number; data: MarkPaidRequest }
    >({
      query: ({ id, data }) => ({
        url: `${controller}/${id}/mark-paid`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PaymentReminder', id },
        'PaymentReminder',
      ],
    }),

    // Get payment reminders stats
    getPaymentReminderStats: builder.query<GetStatsResponse, void>({
      query: () => `${controller}/stats`,
      providesTags: ['PaymentReminderStats'],
    }),

    // Send test email
    sendTestEmail: builder.mutation<TestEmailResponse, TestEmailRequest>({
      query: (data) => ({
        url: 'test/send-email',
        method: 'POST',
        body: data,
      }),
    }),

    // Check reminders (cron job endpoint)
    checkReminders: builder.query<CheckRemindersResponse, void>({
      query: () => `${controller}/check`,
    }),

    // Get notifications
    getNotifications: builder.query<GetNotificationsResponse, void>({
      query: () => `${controller}/notifications`,
      providesTags: ['PaymentNotification'],
    }),

    // Process notification
    processNotification: builder.mutation<ProcessNotificationResponse, number>({
      query: (id) => ({
        url: `${controller}/notifications/${id}`,
        method: 'PUT',
      }),
      invalidatesTags: ['PaymentNotification'],
    }),
  }),
  overrideExisting: false,
});

// Export hooks
export const {
  useCreatePaymentReminderMutation,
  useGetPaymentRemindersQuery,
  useGetPaymentReminderByIdQuery,
  useUpdatePaymentReminderMutation,
  useDeletePaymentReminderMutation,
  useMarkPaymentPaidMutation,
  useGetPaymentReminderStatsQuery,
  useSendTestEmailMutation,
  useCheckRemindersQuery,
  useGetNotificationsQuery,
  useProcessNotificationMutation,
  
  // Lazy queries
  useLazyGetPaymentRemindersQuery,
  useLazyGetPaymentReminderByIdQuery,
  useLazyCheckRemindersQuery,
  useLazyGetNotificationsQuery,
} = paymentRemindersApi;