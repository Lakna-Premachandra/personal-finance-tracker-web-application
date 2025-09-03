import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create email transporter
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,     
        pass: process.env.EMAIL_APP_PASSWORD  
      }
    });
  }

  async sendEmail(to: string, subject: string, htmlContent: string) {
    try {
      const mailOptions = {
        from: `"Finance Tracker" <${process.env.FROM_EMAIL}>`,
        to: to,
        subject: subject,
        html: htmlContent
      };

      // This actually sends the email
      const result = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent successfully to ${to}`);
      console.log(`Message ID: ${result.messageId}`);
      
      return { 
        success: true, 
        messageId: result.messageId 
      };

    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  // Specific method for payment reminders
  async sendPaymentReminderEmail(
    to: string, 
    username: string, 
    reminderDetails: {
      title: string;
      amount: number;
      category: string;
      dueDate: string;
      daysUntilDue: number;
    }
  ) {
    const { title, amount, category, dueDate, daysUntilDue } = reminderDetails;
    
    let subject = '';
    let urgencyColor = '';
    let messageText = '';

    if (daysUntilDue > 0) {
      subject = `💰 Payment Reminder: ${title} - Due in ${daysUntilDue} days`;
      messageText = `Your payment "${title}" is due in ${daysUntilDue} day(s).`;
      urgencyColor = '#28a745'; // Green
    } else if (daysUntilDue === 0) {
      subject = `🚨 Payment Due Today: ${title}`;
      messageText = `Your payment "${title}" is due today!`;
      urgencyColor = '#ffc107'; // Yellow
    } else {
      subject = `⚠️ Overdue Payment: ${title}`;
      messageText = `Your payment "${title}" is overdue by ${Math.abs(daysUntilDue)} day(s).`;
      urgencyColor = '#dc3545'; // Red
    }

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        
        <div style="background-color: ${urgencyColor}; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">💰 Payment Reminder</h1>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hi ${username},</p>
          <p style="font-size: 16px; color: #333;">${messageText}</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid ${urgencyColor}; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #333;">💳 Payment Details</h3>
            <p><strong>Title:</strong> ${title}</p>
            <p><strong>Amount:</strong> $${amount.toLocaleString()}</p>
            <p><strong>Category:</strong> ${category}</p>
            <p><strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString()}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard/payment-reminders" 
               style="background-color: ${urgencyColor}; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
              📱 Manage Reminders
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            This is an automated reminder from your Finance Tracker.
          </p>
        </div>
        
      </div>
    `;

    return await this.sendEmail(to, subject, htmlContent);
  }
}