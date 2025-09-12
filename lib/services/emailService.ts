import nodemailer from 'nodemailer';

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });
  }

  // Base email template with blue theme
  private getEmailTemplate(content: string): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BudgetMate</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8fafc;
            color: #334155;
            line-height: 1.6;
          }
          
          .email-container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            overflow: hidden;
          }
          
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            padding: 32px 40px;
            text-align: center;
            color: white;
          }
          
          .logo {
            width: 48px;
            height: 48px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 12px;
            margin: 0 auto 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 20px;
          }
          
          .brand-name {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 4px;
          }
          
          .content {
            padding: 40px;
          }
          
          .btn-primary {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            text-decoration: none;
            padding: 14px 28px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
            margin: 24px 0;
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.5);
            transition: all 0.2s ease;
          }
          
          .btn-primary:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 12px -1px rgba(59, 130, 246, 0.6);
          }
          
          .btn-warning {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.5);
          }
          
          .btn-danger {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.5);
          }
          
          .info-card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
          }
          
          .info-card h3 {
            color: #1e293b;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .info-row:last-child {
            border-bottom: none;
          }
          
          .info-label {
            color: #64748b;
            font-weight: 500;
          }
          
          .info-value {
            color: #1e293b;
            font-weight: 600;
          }
          
          .footer {
            background: #f8fafc;
            padding: 32px 40px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 14px;
          }
          
          .social-links {
            margin: 16px 0;
          }
          
          .social-links a {
            display: inline-block;
            width: 36px;
            height: 36px;
            background: #e2e8f0;
            color: #64748b;
            text-decoration: none;
            border-radius: 8px;
            margin: 0 4px;
            line-height: 36px;
            transition: all 0.2s ease;
          }
          
          .social-links a:hover {
            background: #3b82f6;
            color: white;
          }
          
          .feature-list {
            list-style: none;
            margin: 20px 0;
          }
          
          .feature-list li {
            padding: 8px 0;
            position: relative;
            padding-left: 24px;
          }
          
          .feature-list li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
          }
          
          @media (max-width: 640px) {
            .email-container {
              margin: 20px;
              border-radius: 12px;
            }
            
            .header, .content, .footer {
              padding: 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <div class="brand-name">BudgetMate</div>
          </div>
          
          <div class="content">
            ${content}
          </div>
          
          <div class="footer">
            <div class="social-links">
              <a href="#" title="Facebook">f</a>
              <a href="#" title="Twitter">𝕏</a>
              <a href="#" title="LinkedIn">in</a>
            </div>
            <p>You received this email from BudgetMate in response to your account activity.</p>
            <p>If you didn't sign up or would like to unsubscribe, <a href="#" style="color: #3b82f6;">click here</a>.</p>
            <p style="margin-top: 16px; color: #94a3b8;">
              BudgetMate Inc. • 123 Finance Street, Money City, FC 12345
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  async sendEmail(to: string, subject: string, htmlContent: string) {
    try {
      const mailOptions = {
        from: `"BudgetMate" <${process.env.EMAIL_USER}>`,
        to: to,
        subject: subject,
        html: htmlContent
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}`);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('❌ Error sending email:', error);
      throw error;
    }
  }

  // Enhanced birthday email with blue theme
  async sendBirthdayNotificationEmail(to: string, username: string) {
    const subject = `🎉 Happy Birthday ${username}!`;
    
    const content = `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
        <h1 style="color: #1e293b; font-size: 28px; font-weight: 700; margin-bottom: 8px;">
          Happy Birthday ${username}!
        </h1>
        <p style="color: #64748b; font-size: 16px;">
          We hope you have a wonderful day filled with joy and celebration!
        </p>
      </div>
      
      <p style="font-size: 16px; margin-bottom: 24px;">Hi ${username},</p>
      
      <p style="font-size: 16px; margin-bottom: 24px;">
        On your special day, we're excited to let you know that you can now unlock premium features 
        to take your financial management to the next level!
      </p>
      
      <div class="info-card">
        <h3>🎁 Birthday Upgrade Benefits</h3>
        <ul class="feature-list">
          <li>Advanced budgeting tools with AI insights</li>
          <li>Investment portfolio tracking and analysis</li>
          <li>Detailed financial reports and forecasting</li>
          <li>Priority customer support</li>
          <li>Custom spending categories and goals</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard" class="btn-primary">
          🚀 Explore Your Dashboard
        </a>
      </div>
      
      <p style="font-size: 16px; color: #64748b;">
        Thank you for being part of the BudgetMate family. Here's to another year of smart financial decisions!
      </p>
      
      <p style="font-size: 16px; margin-top: 32px;">
        <strong>Best regards,</strong><br>
        The BudgetMate Team
      </p>
    `;

    const htmlContent = this.getEmailTemplate(content);
    return await this.sendEmail(to, subject, htmlContent);
  }

  // Enhanced payment reminder email with blue theme
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
    let buttonClass = 'btn-primary';
    let iconEmoji = '';
    let statusMessage = '';
    let statusColor = '#3b82f6';

    if (daysUntilDue > 0) {
      subject = `💰 Payment Reminder: ${title}`;
      statusMessage = `Your payment is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`;
      iconEmoji = '💰';
      statusColor = '#10b981';
    } else if (daysUntilDue === 0) {
      subject = `🚨 Payment Due Today: ${title}`;
      statusMessage = `Your payment is due today`;
      iconEmoji = '🚨';
      buttonClass = 'btn-warning';
      statusColor = '#f59e0b';
    } else {
      subject = `⚠️ Overdue Payment: ${title}`;
      statusMessage = `Your payment is overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? 's' : ''}`;
      iconEmoji = '⚠️';
      buttonClass = 'btn-danger';
      statusColor = '#ef4444';
    }

    const content = `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="font-size: 64px; margin-bottom: 16px;">${iconEmoji}</div>
        <h1 style="color: #1e293b; font-size: 28px; font-weight: 700; margin-bottom: 8px;">
          Payment Reminder
        </h1>
        <p style="color: ${statusColor}; font-size: 18px; font-weight: 600;">
          ${statusMessage}
        </p>
      </div>
      
      <p style="font-size: 16px; margin-bottom: 24px;">Hi ${username},</p>
      
      <p style="font-size: 16px; margin-bottom: 24px;">
        This is a friendly reminder about your upcoming payment. Please review the details below 
        and take action as needed.
      </p>
      
      <div class="info-card">
        <h3>💳 Payment Details</h3>
        <div class="info-row">
          <span class="info-label">Payment Title:</span>
          <span class="info-value">${title}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Amount:</span>
          <span class="info-value" style="color: ${statusColor};">$${amount.toLocaleString()}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Category:</span>
          <span class="info-value">${category}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Due Date:</span>
          <span class="info-value">${new Date(dueDate).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
      </div>
      
      <div style="text-align: center; margin: 32px 0; color:white">
        <a style='color:white' href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/payment-reminders" 
           class="${buttonClass}">
          Manage Payment Reminders
        </a>
      </div>
      
      <p style="font-size: 16px; color: #64748b; ">
        Stay on top of your finances with BudgetMate's smart reminder system. 
        Never miss a payment again!
      </p>
      
      <p style="font-size: 16px; margin-top: 32px;">
        <strong>Best regards,</strong><br>
        The BudgetMate Team
      </p>
    `;

    const htmlContent = this.getEmailTemplate(content);
    return await this.sendEmail(to, subject, htmlContent);
  }

  // New method for project invitation emails (like the design shown)
  async sendProjectInvitationEmail(
    to: string,
    inviterName: string,
    projectName: string,
    inviterAvatar?: string
  ) {
    const subject = `${inviterName} invited you to join "${projectName}"`;
    
    const content = `
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 16px; overflow: hidden; position: relative; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: 700;">
          ${inviterAvatar ? `<img src="${inviterAvatar}" style="width: 100%; height: 100%; object-fit: cover;" alt="${inviterName}">` : inviterName.charAt(0).toUpperCase()}
          <div style="position: absolute; bottom: -2px; right: -2px; width: 24px; height: 24px; background: #10b981; border-radius: 50%; border: 3px solid white;"></div>
        </div>
        <h1 style="color: #1e293b; font-size: 28px; font-weight: 700; margin-bottom: 8px;">
          ${inviterName} invited you
        </h1>
        <p style="color: #64748b; font-size: 16px; max-width: 400px; margin: 0 auto;">
          Your friend ${inviterName} has invited you to join their budget project "${projectName}". 
          You can accept this invitation by clicking the button below.
        </p>
      </div>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/accept-invitation" 
           class="btn-primary" style="font-size: 16px; padding: 16px 32px;">
          Accept Invitation
        </a>
      </div>
      
      <div class="info-card">
        <h3>🤝 Collaborative Budgeting</h3>
        <ul class="feature-list">
          <li>Share expenses and track group spending</li>
          <li>Set joint financial goals and milestones</li>
          <li>Real-time collaboration on budget planning</li>
          <li>Transparent expense tracking for all members</li>
        </ul>
      </div>
      
      <p style="font-size: 14px; color: #64748b; text-align: center; margin-top: 32px;">
        If you don't want to receive collaboration invitations, you can update your preferences in your account settings.
      </p>
    `;

    const htmlContent = this.getEmailTemplate(content);
    return await this.sendEmail(to, subject, htmlContent);
  }
}