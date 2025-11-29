/**
 * ORBIT Staffing OS - Email Campaign Service
 * 
 * Mass email and campaign management for:
 * - Worker recruitment emails
 * - Client outreach
 * - Payroll notifications
 * - Compliance reminders
 * - Job opportunity broadcasts
 * 
 * Supports templates, scheduling, and analytics
 */

// ========================
// TYPES
// ========================

export type CampaignType = 
  | 'recruitment'
  | 'client_outreach'
  | 'payroll_notification'
  | 'compliance_reminder'
  | 'job_broadcast'
  | 'newsletter'
  | 'announcement'
  | 'custom';

export type CampaignStatus = 
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'paused'
  | 'cancelled';

export interface EmailRecipient {
  id: string;
  email: string;
  name?: string;
  type: 'worker' | 'client' | 'admin' | 'custom';
  metadata?: Record<string, string>;
}

export interface EmailTemplate {
  id: string;
  name: string;
  type: CampaignType;
  subject: string;
  htmlContent: string;
  textContent?: string;
  placeholders: string[];
  version: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  type: CampaignType;
  templateId: string;
  status: CampaignStatus;
  recipients: EmailRecipient[];
  subject: string;
  content: string;
  scheduledAt?: Date;
  sentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  createdBy: string;
  analytics: CampaignAnalytics;
}

export interface CampaignAnalytics {
  totalRecipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;
}

export interface SendResult {
  success: boolean;
  messageId?: string;
  recipient: string;
  error?: string;
  sentAt: Date;
}

// ========================
// EMAIL TEMPLATES
// ========================

const EMAIL_TEMPLATES: Record<CampaignType, EmailTemplate> = {
  recruitment: {
    id: 'tpl_recruitment',
    name: 'Worker Recruitment',
    type: 'recruitment',
    subject: 'Join {{companyName}} - Exciting Job Opportunities Available!',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #06b6d4, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; }
    .button { display: inline-block; background: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .jobs { background: white; padding: 15px; margin: 15px 0; border-radius: 6px; border-left: 4px solid #06b6d4; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{companyName}}</h1>
      <p>Your Next Opportunity Awaits</p>
    </div>
    <div class="content">
      <p>Hello {{recipientName}},</p>
      <p>We have exciting job opportunities that match your skills and experience!</p>
      
      <div class="jobs">
        <strong>Current Openings:</strong>
        <ul>
          {{jobList}}
        </ul>
      </div>
      
      <p>Benefits of working with us:</p>
      <ul>
        <li>Competitive pay rates</li>
        <li>Weekly paychecks</li>
        <li>Flexible scheduling</li>
        <li>GPS-verified time tracking</li>
        <li>Performance bonuses</li>
      </ul>
      
      <center>
        <a href="{{applyUrl}}" class="button">Apply Now</a>
      </center>
    </div>
    <div class="footer">
      <p>{{companyName}} | {{companyAddress}}</p>
      <p><a href="{{unsubscribeUrl}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,
    placeholders: ['companyName', 'recipientName', 'jobList', 'applyUrl', 'companyAddress', 'unsubscribeUrl'],
    version: '1.0',
  },
  
  client_outreach: {
    id: 'tpl_client_outreach',
    name: 'Client Outreach',
    type: 'client_outreach',
    subject: 'Staffing Solutions for {{clientCompany}} - {{companyName}}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e40af, #3b82f6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; }
    .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
    .stats { display: flex; justify-content: space-around; text-align: center; margin: 20px 0; }
    .stat { background: white; padding: 15px 25px; border-radius: 8px; }
    .stat-number { font-size: 24px; font-weight: bold; color: #1e40af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{companyName}}</h1>
      <p>Professional Staffing Solutions</p>
    </div>
    <div class="content">
      <p>Dear {{recipientName}},</p>
      <p>I hope this message finds you well. I'm reaching out from {{companyName}} to introduce our comprehensive staffing solutions that can help {{clientCompany}} meet your workforce needs.</p>
      
      <div class="stats">
        <div class="stat">
          <div class="stat-number">500+</div>
          <div>Qualified Workers</div>
        </div>
        <div class="stat">
          <div class="stat-number">98%</div>
          <div>Fill Rate</div>
        </div>
        <div class="stat">
          <div class="stat-number">24/7</div>
          <div>Support</div>
        </div>
      </div>
      
      <p><strong>Our Services:</strong></p>
      <ul>
        <li>Temporary staffing</li>
        <li>Temp-to-hire solutions</li>
        <li>Direct placement</li>
        <li>Managed services</li>
        <li>On-site management</li>
      </ul>
      
      <center>
        <a href="{{meetingUrl}}" class="button">Schedule a Call</a>
      </center>
    </div>
    <div class="footer">
      <p>{{companyName}} | {{companyPhone}} | {{companyEmail}}</p>
    </div>
  </div>
</body>
</html>`,
    placeholders: ['companyName', 'recipientName', 'clientCompany', 'meetingUrl', 'companyPhone', 'companyEmail'],
    version: '1.0',
  },
  
  payroll_notification: {
    id: 'tpl_payroll',
    name: 'Payroll Notification',
    type: 'payroll_notification',
    subject: 'Your Pay Statement is Ready - {{payPeriod}}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; }
    .pay-summary { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .amount { font-size: 32px; font-weight: bold; color: #10b981; text-align: center; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>💰 Payday!</h1>
    </div>
    <div class="content">
      <p>Hi {{recipientName}},</p>
      <p>Your pay statement for {{payPeriod}} is now available.</p>
      
      <div class="pay-summary">
        <p style="text-align: center; color: #666;">Net Pay</p>
        <div class="amount">${{netPay}}</div>
        <hr style="margin: 15px 0;">
        <p><strong>Gross Pay:</strong> ${{grossPay}}</p>
        <p><strong>Hours Worked:</strong> {{hoursWorked}}</p>
        <p><strong>Deductions:</strong> ${{deductions}}</p>
        <p><strong>Deposit Date:</strong> {{depositDate}}</p>
      </div>
      
      <center>
        <a href="{{viewPaystubUrl}}" class="button">View Full Pay Stub</a>
      </center>
    </div>
  </div>
</body>
</html>`,
    placeholders: ['recipientName', 'payPeriod', 'netPay', 'grossPay', 'hoursWorked', 'deductions', 'depositDate', 'viewPaystubUrl'],
    version: '1.0',
  },
  
  compliance_reminder: {
    id: 'tpl_compliance',
    name: 'Compliance Reminder',
    type: 'compliance_reminder',
    subject: '⚠️ Action Required: {{complianceItem}} Expires {{expirationDate}}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; }
    .alert-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⚠️ Compliance Reminder</h1>
    </div>
    <div class="content">
      <p>Hi {{recipientName}},</p>
      
      <div class="alert-box">
        <strong>Action Required:</strong> Your {{complianceItem}} will expire on {{expirationDate}}.
      </div>
      
      <p>Please take action to renew or update the following before the deadline:</p>
      <ul>
        <li><strong>Item:</strong> {{complianceItem}}</li>
        <li><strong>Current Status:</strong> {{currentStatus}}</li>
        <li><strong>Expires:</strong> {{expirationDate}}</li>
        <li><strong>Days Remaining:</strong> {{daysRemaining}}</li>
      </ul>
      
      <center>
        <a href="{{actionUrl}}" class="button">Update Now</a>
      </center>
      
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        Failure to maintain compliance may result in suspension of work assignments.
      </p>
    </div>
  </div>
</body>
</html>`,
    placeholders: ['recipientName', 'complianceItem', 'expirationDate', 'currentStatus', 'daysRemaining', 'actionUrl'],
    version: '1.0',
  },
  
  job_broadcast: {
    id: 'tpl_job_broadcast',
    name: 'Job Opportunity Broadcast',
    type: 'job_broadcast',
    subject: '🔥 New Job Alert: {{jobTitle}} - ${{payRate}}/hr',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #06b6d4, #10b981); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; }
    .job-card { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; border: 1px solid #e5e7eb; }
    .pay-badge { background: #10b981; color: white; padding: 5px 12px; border-radius: 20px; display: inline-block; font-weight: bold; }
    .button { display: inline-block; background: #06b6d4; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔥 New Job Alert</h1>
    </div>
    <div class="content">
      <p>Hi {{recipientName}},</p>
      <p>A new job matching your skills is now available!</p>
      
      <div class="job-card">
        <h2>{{jobTitle}}</h2>
        <span class="pay-badge">${{payRate}}/hr</span>
        
        <p style="margin-top: 15px;"><strong>📍 Location:</strong> {{jobLocation}}</p>
        <p><strong>📅 Start Date:</strong> {{startDate}}</p>
        <p><strong>⏰ Shift:</strong> {{shiftDetails}}</p>
        <p><strong>📝 Description:</strong></p>
        <p>{{jobDescription}}</p>
        
        <p><strong>Requirements:</strong></p>
        <ul>
          {{requirements}}
        </ul>
      </div>
      
      <center>
        <a href="{{applyUrl}}" class="button">Apply Now - Limited Spots!</a>
      </center>
      
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        This position fills quickly. Apply within 24 hours for best consideration.
      </p>
    </div>
  </div>
</body>
</html>`,
    placeholders: ['recipientName', 'jobTitle', 'payRate', 'jobLocation', 'startDate', 'shiftDetails', 'jobDescription', 'requirements', 'applyUrl'],
    version: '1.0',
  },
  
  newsletter: {
    id: 'tpl_newsletter',
    name: 'Company Newsletter',
    type: 'newsletter',
    subject: '{{companyName}} Newsletter - {{month}} {{year}}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #3b82f6, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; }
    .section { background: white; padding: 20px; margin: 15px 0; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>{{companyName}}</h1>
      <p>{{month}} {{year}} Newsletter</p>
    </div>
    <div class="content">
      <p>Hello {{recipientName}},</p>
      <p>Here's what's new this month:</p>
      
      <div class="section">
        <h3>📢 Company Updates</h3>
        <p>{{companyUpdates}}</p>
      </div>
      
      <div class="section">
        <h3>🏆 Top Performers</h3>
        <p>{{topPerformers}}</p>
      </div>
      
      <div class="section">
        <h3>📅 Upcoming Events</h3>
        <p>{{upcomingEvents}}</p>
      </div>
      
      <p>Thanks for being part of the team!</p>
    </div>
  </div>
</body>
</html>`,
    placeholders: ['companyName', 'month', 'year', 'recipientName', 'companyUpdates', 'topPerformers', 'upcomingEvents'],
    version: '1.0',
  },
  
  announcement: {
    id: 'tpl_announcement',
    name: 'General Announcement',
    type: 'announcement',
    subject: '📣 {{announcementTitle}} - {{companyName}}',
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1e40af; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8f9fa; padding: 30px; }
    .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📣 {{announcementTitle}}</h1>
    </div>
    <div class="content">
      <p>Hi {{recipientName}},</p>
      <p>{{announcementBody}}</p>
      
      {{#if actionUrl}}
      <center>
        <a href="{{actionUrl}}" class="button">{{actionText}}</a>
      </center>
      {{/if}}
      
      <p>Best regards,<br>{{senderName}}<br>{{companyName}}</p>
    </div>
  </div>
</body>
</html>`,
    placeholders: ['announcementTitle', 'recipientName', 'announcementBody', 'actionUrl', 'actionText', 'senderName', 'companyName'],
    version: '1.0',
  },
  
  custom: {
    id: 'tpl_custom',
    name: 'Custom Email',
    type: 'custom',
    subject: '{{subject}}',
    htmlContent: '{{customContent}}',
    placeholders: ['subject', 'customContent'],
    version: '1.0',
  },
};

// ========================
// CAMPAIGN FUNCTIONS
// ========================

export function getEmailTemplate(type: CampaignType): EmailTemplate {
  return EMAIL_TEMPLATES[type];
}

export function getAllEmailTemplates(): EmailTemplate[] {
  return Object.values(EMAIL_TEMPLATES);
}

export function renderEmailTemplate(
  template: EmailTemplate,
  data: Record<string, string>
): { subject: string; html: string; text?: string } {
  let subject = template.subject;
  let html = template.htmlContent;
  
  // Replace all placeholders
  for (const [key, value] of Object.entries(data)) {
    const placeholder = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(placeholder, value);
    html = html.replace(placeholder, value);
  }
  
  return { subject, html };
}

export function createCampaign(params: {
  name: string;
  type: CampaignType;
  templateId?: string;
  recipients: EmailRecipient[];
  subject: string;
  content: string;
  scheduledAt?: Date;
  tenantId: string;
  createdBy: string;
}): EmailCampaign {
  const id = `camp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  
  return {
    id,
    name: params.name,
    type: params.type,
    templateId: params.templateId || EMAIL_TEMPLATES[params.type].id,
    status: params.scheduledAt ? 'scheduled' : 'draft',
    recipients: params.recipients,
    subject: params.subject,
    content: params.content,
    scheduledAt: params.scheduledAt,
    createdAt: new Date(),
    updatedAt: new Date(),
    tenantId: params.tenantId,
    createdBy: params.createdBy,
    analytics: {
      totalRecipients: params.recipients.length,
      sent: 0,
      delivered: 0,
      opened: 0,
      clicked: 0,
      bounced: 0,
      unsubscribed: 0,
      openRate: 0,
      clickRate: 0,
      bounceRate: 0,
    },
  };
}

export async function sendCampaign(campaign: EmailCampaign): Promise<SendResult[]> {
  const results: SendResult[] = [];
  
  console.log(`[Email Campaign] Starting campaign "${campaign.name}" to ${campaign.recipients.length} recipients`);
  
  // In production, integrate with email service (SendGrid, Mailgun, AWS SES)
  // For now, simulate sending
  for (const recipient of campaign.recipients) {
    const result: SendResult = {
      success: true, // In production, check actual send result
      messageId: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      recipient: recipient.email,
      sentAt: new Date(),
    };
    
    console.log(`[Email Campaign] [QUEUED] To: ${recipient.email}, Subject: ${campaign.subject}`);
    
    results.push(result);
  }
  
  console.log(`[Email Campaign] Campaign "${campaign.name}" queued - ${results.filter(r => r.success).length}/${results.length} successful`);
  
  return results;
}

export function calculateCampaignAnalytics(results: SendResult[]): CampaignAnalytics {
  const total = results.length;
  const sent = results.filter(r => r.success).length;
  
  // In production, these would be tracked via email service webhooks
  // For now, return simulated metrics
  const delivered = Math.floor(sent * 0.98); // 98% delivery rate
  const opened = Math.floor(delivered * 0.25); // 25% open rate
  const clicked = Math.floor(opened * 0.15); // 15% click rate
  const bounced = sent - delivered;
  const unsubscribed = Math.floor(opened * 0.01); // 1% unsubscribe rate
  
  return {
    totalRecipients: total,
    sent,
    delivered,
    opened,
    clicked,
    bounced,
    unsubscribed,
    openRate: total > 0 ? (opened / total) * 100 : 0,
    clickRate: total > 0 ? (clicked / total) * 100 : 0,
    bounceRate: total > 0 ? (bounced / total) * 100 : 0,
  };
}

// ========================
// RECIPIENT MANAGEMENT
// ========================

export interface RecipientList {
  id: string;
  name: string;
  type: 'workers' | 'clients' | 'custom';
  count: number;
  filters?: RecipientFilters;
}

export interface RecipientFilters {
  skills?: string[];
  availability?: string;
  status?: string;
  city?: string;
  state?: string;
  minRating?: number;
  registeredAfter?: Date;
}

export function filterRecipients(
  recipients: EmailRecipient[],
  filters: RecipientFilters
): EmailRecipient[] {
  // In production, apply actual filters based on worker/client data
  // For now, return all recipients (placeholder)
  console.log(`[Email Campaign] Filtering recipients with:`, filters);
  return recipients;
}

// ========================
// SCHEDULING
// ========================

export interface ScheduledCampaign {
  campaignId: string;
  scheduledAt: Date;
  timezone: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export function scheduleCampaign(
  campaign: EmailCampaign,
  scheduledAt: Date,
  timezone: string = 'America/New_York'
): ScheduledCampaign {
  return {
    campaignId: campaign.id,
    scheduledAt,
    timezone,
    status: 'pending',
  };
}

// ========================
// UNSUBSCRIBE MANAGEMENT
// ========================

export interface UnsubscribeRecord {
  email: string;
  unsubscribedAt: Date;
  reason?: string;
  campaignId?: string;
}

export function isUnsubscribed(email: string, unsubscribeList: UnsubscribeRecord[]): boolean {
  return unsubscribeList.some(r => r.email.toLowerCase() === email.toLowerCase());
}

export function addToUnsubscribeList(
  email: string,
  reason?: string,
  campaignId?: string
): UnsubscribeRecord {
  return {
    email: email.toLowerCase(),
    unsubscribedAt: new Date(),
    reason,
    campaignId,
  };
}
