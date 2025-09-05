// import { NextRequest, NextResponse } from 'next/server';
// import { EmailService } from '@/lib/services/emailService';

// export async function POST(request: NextRequest) {
//   try {
//     const { testSecret, recipientEmail, testType } = await request.json();
    
//     if (testSecret !== process.env.EMAIL_TEST_SECRET) {
//       return NextResponse.json(
//         { error: 'Invalid test secret' },
//         { status: 401 }
//       );
//     }

//     if (!recipientEmail) {
//       return NextResponse.json(
//         { error: 'Recipient email is required' },
//         { status: 400 }
//       );
//     }

//     const emailService = new EmailService();
    
//     if (testType === 'payment-reminder') {
//       // Test payment reminder email
//       const testReminderDetails = {
//         title: 'Test University Tuition',
//         amount: 5000,
//         category: 'Education',
//         dueDate: '2025-09-10',
//         daysUntilDue: 7
//       };

//       const result = await emailService.sendPaymentReminderEmail(
//         recipientEmail,
//         'Test User',
//         testReminderDetails
//       );

//       return NextResponse.json({
//         success: true,
//         message: 'Test payment reminder email sent successfully',
//         messageId: result.messageId
//       });
//     }

//     // test email
//     const result = await emailService.sendEmail(
//       recipientEmail,
//       'Test Email from Finance Tracker',
//       `
//         <div style="font-family: Arial, sans-serif; padding: 20px;">
//           <h2 style="color: #333;">✅ Email Service Test</h2>
//           <p>This is a test email to verify your email configuration is working correctly.</p>
//           <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
//           <p>If you received this email, your email service is configured properly! 🎉</p>
//         </div>
//       `
//     );

//     return NextResponse.json({
//       success: true,
//       message: 'Test email sent successfully',
//       messageId: result.messageId
//     });

//   } catch (error: any) {
//     console.error('Error sending test email:', error);
//     return NextResponse.json(
//       { error: error.message || 'Failed to send test email' },
//       { status: 500 }
//     );
//   }
// }

import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/services/emailService';

export async function POST(request: NextRequest) {
  try {
    const { testSecret, recipientEmail, testType } = await request.json();
    
    if (testSecret !== process.env.EMAIL_TEST_SECRET) {
      return NextResponse.json({ error: 'Invalid test secret' }, { status: 401 });
    }

    if (!recipientEmail) {
      return NextResponse.json({ error: 'Recipient email is required' }, { status: 400 });
    }

    const emailService = new EmailService();
    
    if (testType === 'birthday') {
      await emailService.sendBirthdayNotificationEmail(recipientEmail, 'Test User');
      return NextResponse.json({ 
        success: true, 
        message: 'Birthday email sent successfully' 
      });
    }
    
    if (testType === 'payment') {
      await emailService.sendPaymentReminderEmail(recipientEmail, 'Test User', {
        title: 'Test Payment Reminder',
        amount: 1500,
        category: 'Education',
        dueDate: '2025-09-15',
        daysUntilDue: 3
      });
      return NextResponse.json({ 
        success: true, 
        message: 'Payment reminder email sent successfully' 
      });
    }

    return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });

  } catch (error: any) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send test email' },
      { status: 500 }
    );
  }
}
