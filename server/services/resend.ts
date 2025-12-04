import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY 
    ? 'repl ' + process.env.REPL_IDENTITY 
    : process.env.WEB_REPL_RENEWAL 
    ? 'depl ' + process.env.WEB_REPL_RENEWAL 
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return {
    apiKey: connectionSettings.settings.api_key, 
    fromEmail: connectionSettings.settings.from_email
  };
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
}

export async function sendEmail(options: EmailOptions) {
  try {
    const { client, fromEmail } = await getResendClient();
    
    const emailPayload: any = {
      from: fromEmail || 'ORBIT Staffing <noreply@orbitstaffing.io>',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
    };

    if (options.html) {
      emailPayload.html = options.html;
    }
    if (options.text) {
      emailPayload.text = options.text;
    }
    if (options.replyTo) {
      emailPayload.replyTo = options.replyTo;
    }
    
    const result = await client.emails.send(emailPayload);

    console.log('[Resend] Email sent:', result);
    return { success: true, data: result };
  } catch (error: any) {
    console.error('[Resend] Error sending email:', error);
    return { success: false, error: error.message };
  }
}

export async function sendWelcomeEmail(workerName: string, workerEmail: string) {
  return sendEmail({
    to: workerEmail,
    subject: 'Welcome to ORBIT Staffing!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px;">
          <h1 style="color: #22d3ee; margin: 0;">Welcome to ORBIT</h1>
          <p style="color: #94a3b8; margin-top: 10px;">Your staffing journey starts here</p>
        </div>
        
        <div style="padding: 30px 0;">
          <p style="color: #334155; font-size: 16px;">Hi ${workerName},</p>
          <p style="color: #334155; font-size: 16px;">
            Thank you for joining ORBIT Staffing! We're excited to have you on board.
          </p>
          <p style="color: #334155; font-size: 16px;">
            Our team will review your application and reach out soon with available opportunities 
            that match your skills and preferences.
          </p>
          
          <div style="margin: 30px 0; padding: 20px; background: #f1f5f9; border-radius: 8px;">
            <h3 style="color: #0f172a; margin: 0 0 10px 0;">What's Next?</h3>
            <ul style="color: #475569; margin: 0; padding-left: 20px;">
              <li>Complete your profile to increase your chances of getting matched</li>
              <li>Set your availability in the worker portal</li>
              <li>Watch for assignment notifications via email and SMS</li>
            </ul>
          </div>
          
          <p style="color: #334155; font-size: 16px;">
            Questions? Reply to this email or contact our support team anytime.
          </p>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            Powered by ORBIT Staffing OS<br>
            <a href="https://orbitstaffing.io" style="color: #22d3ee;">orbitstaffing.io</a>
          </p>
        </div>
      </div>
    `
  });
}

export async function sendAssignmentNotification(
  workerName: string, 
  workerEmail: string, 
  jobTitle: string,
  clientName: string,
  startDate: string,
  location: string
) {
  return sendEmail({
    to: workerEmail,
    subject: `New Assignment: ${jobTitle} at ${clientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px;">
          <h1 style="color: #22d3ee; margin: 0;">New Assignment</h1>
          <p style="color: #94a3b8; margin-top: 10px;">You've been matched!</p>
        </div>
        
        <div style="padding: 30px 0;">
          <p style="color: #334155; font-size: 16px;">Hi ${workerName},</p>
          <p style="color: #334155; font-size: 16px;">
            Great news! You've been assigned to a new position:
          </p>
          
          <div style="margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 8px; color: white;">
            <h2 style="color: #22d3ee; margin: 0 0 15px 0;">${jobTitle}</h2>
            <p style="margin: 5px 0;"><strong>Client:</strong> ${clientName}</p>
            <p style="margin: 5px 0;"><strong>Start Date:</strong> ${startDate}</p>
            <p style="margin: 5px 0;"><strong>Location:</strong> ${location}</p>
          </div>
          
          <p style="color: #334155; font-size: 16px;">
            Please log in to your worker portal to view full details and confirm your availability.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://orbitstaffing.io/worker" style="display: inline-block; padding: 12px 30px; background: #22d3ee; color: #0f172a; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Assignment
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            Powered by ORBIT Staffing OS<br>
            <a href="https://orbitstaffing.io" style="color: #22d3ee;">orbitstaffing.io</a>
          </p>
        </div>
      </div>
    `
  });
}

export async function sendPayrollConfirmation(
  workerName: string,
  workerEmail: string,
  payPeriod: string,
  grossPay: string,
  netPay: string,
  payDate: string
) {
  return sendEmail({
    to: workerEmail,
    subject: `Payroll Processed - ${payPeriod}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px;">
          <h1 style="color: #22d3ee; margin: 0;">Payroll Processed</h1>
          <p style="color: #94a3b8; margin-top: 10px;">Your payment is on the way!</p>
        </div>
        
        <div style="padding: 30px 0;">
          <p style="color: #334155; font-size: 16px;">Hi ${workerName},</p>
          <p style="color: #334155; font-size: 16px;">
            Your payroll for ${payPeriod} has been processed.
          </p>
          
          <div style="margin: 20px 0; padding: 20px; background: #f1f5f9; border-radius: 8px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 10px 0; color: #64748b;">Pay Period:</td>
                <td style="padding: 10px 0; color: #0f172a; text-align: right; font-weight: bold;">${payPeriod}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b;">Gross Pay:</td>
                <td style="padding: 10px 0; color: #0f172a; text-align: right; font-weight: bold;">${grossPay}</td>
              </tr>
              <tr style="border-top: 1px solid #e2e8f0;">
                <td style="padding: 10px 0; color: #64748b;">Net Pay:</td>
                <td style="padding: 10px 0; color: #22d3ee; text-align: right; font-weight: bold; font-size: 18px;">${netPay}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #64748b;">Payment Date:</td>
                <td style="padding: 10px 0; color: #0f172a; text-align: right; font-weight: bold;">${payDate}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #334155; font-size: 16px;">
            View your full pay stub in the worker portal.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://orbitstaffing.io/worker/payroll-portal" style="display: inline-block; padding: 12px 30px; background: #22d3ee; color: #0f172a; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Pay Stub
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            Powered by ORBIT Staffing OS<br>
            <a href="https://orbitstaffing.io" style="color: #22d3ee;">orbitstaffing.io</a>
          </p>
        </div>
      </div>
    `
  });
}

export async function sendComplianceReminder(
  workerName: string,
  workerEmail: string,
  documentType: string,
  expirationDate: string,
  daysRemaining: number
) {
  const urgencyColor = daysRemaining <= 7 ? '#ef4444' : daysRemaining <= 14 ? '#f59e0b' : '#22d3ee';
  
  return sendEmail({
    to: workerEmail,
    subject: `Action Required: ${documentType} Expires in ${daysRemaining} Days`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 12px;">
          <h1 style="color: ${urgencyColor}; margin: 0;">Compliance Alert</h1>
          <p style="color: #94a3b8; margin-top: 10px;">Action required to stay compliant</p>
        </div>
        
        <div style="padding: 30px 0;">
          <p style="color: #334155; font-size: 16px;">Hi ${workerName},</p>
          <p style="color: #334155; font-size: 16px;">
            Your <strong>${documentType}</strong> is expiring soon:
          </p>
          
          <div style="margin: 20px 0; padding: 20px; background: #fef2f2; border: 1px solid ${urgencyColor}; border-radius: 8px; text-align: center;">
            <p style="color: ${urgencyColor}; font-size: 24px; font-weight: bold; margin: 0;">
              ${daysRemaining} Days Remaining
            </p>
            <p style="color: #64748b; margin: 10px 0 0 0;">
              Expires: ${expirationDate}
            </p>
          </div>
          
          <p style="color: #334155; font-size: 16px;">
            Please update your documentation as soon as possible to maintain your active status 
            and avoid any interruption to your assignments.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://orbitstaffing.io/worker/compliance" style="display: inline-block; padding: 12px 30px; background: ${urgencyColor}; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">
              Update Documents
            </a>
          </div>
        </div>
        
        <div style="text-align: center; padding: 20px; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 12px; margin: 0;">
            Powered by ORBIT Staffing OS<br>
            <a href="https://orbitstaffing.io" style="color: #22d3ee;">orbitstaffing.io</a>
          </p>
        </div>
      </div>
    `
  });
}
