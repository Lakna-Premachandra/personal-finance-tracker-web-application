import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/utils/auth';
import { connectToDatabase, sql } from '@/lib/database/db';
import { PaymentReminderService } from '@/lib/services/paymentReminderService';

const paymentReminderService = new PaymentReminderService();

// GET /api/notifications/[id] - Get all user notifications (birthday + payment reminders)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(params.id);
    
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    if (user.userId !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const pool = await connectToDatabase();
    
    // Get birthday notifications
    const birthdayRequest = pool.request();
    birthdayRequest.input('User_ID', sql.Int, userId);
    const birthdayResult = await birthdayRequest.execute('sp_GetUserNotifications');
    
    // Get payment reminder notifications
    const paymentReminderResult = await paymentReminderService.getUserPaymentReminderNotifications(userId);
    
    // Combine both notification types
    const allNotifications = [
      ...birthdayResult.recordset.map(notification => ({
        ...notification,
        notificationType: 'birthday'
      })),
      ...paymentReminderResult.notifications.map(notification => ({
        ...notification,
        notificationType: 'payment_reminder'
      }))
    ];

    const hasUnprocessedNotifications = birthdayResult.recordset.length > 0 || paymentReminderResult.hasUnprocessed;
    
    return NextResponse.json({
      success: true,
      data: allNotifications,
      hasUnprocessedNotifications,
      counts: {
        birthday: birthdayResult.recordset.length,
        paymentReminder: paymentReminderResult.notifications.length,
        total: allNotifications.length
      }
    });

  } catch (error: any) {
    console.error('Error getting notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get notifications' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/[id] - Process notification (birthday or payment reminder)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const requestedUserId = parseInt(params.id);
    
    if (isNaN(requestedUserId)) {
      return NextResponse.json(
        { error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    if (user.userId !== requestedUserId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { notificationId, userTypeChoice, employmentStatus = 'Unemployed', notificationType } = body;
    
    if (!notificationId) {
      return NextResponse.json(
        { error: 'Notification ID is required' },
        { status: 400 }
      );
    }

    // Determine notification type if not provided
    let determinedNotificationType = notificationType;
    
    if (!determinedNotificationType) {
      // Auto-detect notification type based on whether userTypeChoice is provided
      // Birthday notifications require userTypeChoice, payment reminders don't
      determinedNotificationType = userTypeChoice ? 'birthday' : 'payment_reminder';
    }

    console.log(`Processing ${determinedNotificationType} notification ${notificationId} for user ${requestedUserId}`);

    // Route to appropriate notification handler
    if (determinedNotificationType === 'birthday') {
      return await processBirthdayNotification(requestedUserId, notificationId, userTypeChoice, employmentStatus);
    } else if (determinedNotificationType === 'payment_reminder') {
      return await processPaymentReminderNotification(requestedUserId, notificationId);
    } else {
      return NextResponse.json(
        { error: 'Invalid notification type. Must be "birthday" or "payment_reminder"' },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('Error processing notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process notification' },
      { status: 500 }
    );
  }
}

// Helper function to process birthday notifications
async function processBirthdayNotification(
  requestedUserId: number, 
  notificationId: number, 
  userTypeChoice?: string, 
  employmentStatus: string = 'Unemployed'
) {
  const pool = await connectToDatabase();
  
  // Get the notification details and current user info
  const getNotificationRequest = pool.request();
  getNotificationRequest.input('NotificationId', sql.Int, notificationId);
  getNotificationRequest.input('UserId', sql.Int, requestedUserId);
  
  const notificationResult = await getNotificationRequest.query(`
    SELECT 
      bn.Notification_ID,
      bn.User_ID,
      bn.Is_Processed,
      u.Age,
      u.Type,
      u.Username
    FROM Birthday_Notifications bn
    INNER JOIN [User] u ON bn.User_ID = u.User_ID
    WHERE bn.Notification_ID = @NotificationId AND bn.User_ID = @UserId
  `);

  if (notificationResult.recordset.length === 0) {
    return NextResponse.json(
      { error: 'Birthday notification not found' },
      { status: 404 }
    );
  }

  const notification = notificationResult.recordset[0];
  
  console.log('Current user state:', {
    userId: notification.User_ID,
    currentAge: notification.Age,
    currentType: notification.Type,
    isProcessed: notification.Is_Processed
  });
  
  if (notification.Is_Processed) {
    return NextResponse.json(
      { error: 'Birthday notification already processed' },
      { status: 400 }
    );
  }

  // Check if this is a birthday notification for transition (age 18+ and currently Student)
  const isBirthdayTransition = notification.Age >= 18 && notification.Type === 'Student';
  let transitionResult = null;

  console.log('Is birthday transition eligible:', isBirthdayTransition);

  // Start transaction for atomic operation
  const transaction = pool.transaction();
  await transaction.begin();

  try {
    // If it's a birthday notification and user made a choice, process the transition
    if (isBirthdayTransition && userTypeChoice) {
      if (!['Student', 'Young-Adult'].includes(userTypeChoice)) {
        await transaction.rollback();
        return NextResponse.json(
          { error: 'Valid user type choice is required (Student or Young-Adult)' },
          { status: 400 }
        );
      }

      console.log(`Executing transition: User ${requestedUserId} -> ${userTypeChoice} with employment: ${employmentStatus}`);

      // Process the user type transition using stored procedure
      const transitionRequest = transaction.request();
      transitionRequest.input('User_ID', sql.Int, requestedUserId);
      transitionRequest.input('New_User_Type', sql.NVarChar(20), userTypeChoice);
      transitionRequest.input('Employment_Status', sql.NVarChar(50), employmentStatus);
      
      const result = await transitionRequest.execute('sp_ProcessBirthdayTransition');
      transitionResult = result.recordset[0];

      console.log('Stored procedure result:', transitionResult);

      if (transitionResult.Type === 'Error') {
        await transaction.rollback();
        console.error('Transition failed:', transitionResult.Status);
        return NextResponse.json(
          { error: transitionResult.Status },
          { status: 400 }
        );
      }
    } else if (isBirthdayTransition && !userTypeChoice) {
      // If it's a birthday transition but no choice provided, require it
      await transaction.rollback();
      return NextResponse.json(
        { error: 'User type choice is required for birthday transition (18+)' },
        { status: 400 }
      );
    }

    // Mark notification as processed
    const updateNotificationRequest = transaction.request();
    updateNotificationRequest.input('NotificationId', sql.Int, notificationId);
    
    const updateResult = await updateNotificationRequest.query(`
      UPDATE Birthday_Notifications 
      SET Is_Processed = 1
      WHERE Notification_ID = @NotificationId
    `);

    console.log('Notification update result:', updateResult.rowsAffected[0]);

    if (updateResult.rowsAffected[0] === 0) {
      await transaction.rollback();
      return NextResponse.json(
        { error: 'Failed to update notification status' },
        { status: 500 }
      );
    }

    await transaction.commit();

    const response: any = {
      success: true,
      message: 'Birthday notification processed successfully',
      notificationProcessed: true,
      notificationType: 'birthday'
    };

    // Include transition details if it occurred
    if (transitionResult && transitionResult.Type === 'Success') {
      response.transitionCompleted = true;
      response.newUserType = transitionResult.NewUserType;
      response.transitionMessage = transitionResult.Status;
      
      // Log the transition for debugging
      console.log(`User ${requestedUserId} successfully transitioned to ${transitionResult.NewUserType}`);
    }

    // Also verify the actual user type after transaction
    const verifyRequest = pool.request();
    verifyRequest.input('UserId', sql.Int, requestedUserId);
    const verifyResult = await verifyRequest.query(`
      SELECT Type, Age FROM [User] WHERE User_ID = @UserId
    `);
    
    if (verifyResult.recordset.length > 0) {
      const currentUserState = verifyResult.recordset[0];
      response.currentUserType = currentUserState.Type;
      response.currentAge = currentUserState.Age;
      console.log('Final user state verification:', currentUserState);
    }

    return NextResponse.json(response);

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

// Helper function to process payment reminder notifications
async function processPaymentReminderNotification(requestedUserId: number, notificationId: number) {
  try {
    const result = await paymentReminderService.markPaymentReminderNotificationAsProcessed(
      requestedUserId, 
      notificationId
    );

    return NextResponse.json({
      success: true,
      message: 'Payment reminder notification processed successfully',
      notificationProcessed: true,
      notificationType: 'payment_reminder',
      rowsAffected: result.rowsAffected
    });

  } catch (error: any) {
    console.error('Error processing payment reminder notification:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process payment reminder notification' },
      { status: 500 }
    );
  }
}

// POST /api/notifications/[id] - Verify user transition status and get notification details
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = verifyToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = parseInt(params.id);
    
    if (isNaN(userId) || user.userId !== userId) {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { action = 'getUserStatus' } = body;

    if (action === 'getUserStatus') {
      const pool = await connectToDatabase();
      const checkRequest = pool.request();
      checkRequest.input('UserId', sql.Int, userId);
      
      // Check current user status and details
      const userResult = await checkRequest.query(`
        SELECT 
          u.User_ID,
          u.Username,
          u.Type,
          u.Age,
          CASE 
            WHEN u.Type = 'Student' THEN sd.Guardian_Contact_No
            WHEN u.Type = 'Young-Adult' THEN ya.Employment_Status
            ELSE NULL
          END as TypeSpecificInfo
        FROM [User] u
        LEFT JOIN Student_Details sd ON u.User_ID = sd.User_ID
        LEFT JOIN YoungAdult_Details ya ON u.User_ID = ya.User_ID
        WHERE u.User_ID = @UserId
      `);

      if (userResult.recordset.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        userData: userResult.recordset[0]
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Error in POST notifications:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}