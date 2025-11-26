import twilio from 'twilio';

let twilioClient: ReturnType<typeof twilio> | null = null;

// SMS Template Types
export type SMSTemplateType = 
  | 'payroll_alert' 
  | 'assignment_notification' 
  | 'garnishment_alert' 
  | 'safety_alert' 
  | 'general_notification';

// SMS Template Definitions
interface SMSTemplate {
  name: SMSTemplateType;
  subject: string;
  template: (data: Record<string, any>) => string;
}

const SMS_TEMPLATES: Record<SMSTemplateType, SMSTemplate> = {
  payroll_alert: {
    name: 'payroll_alert',
    subject: 'Payroll Processed',
    template: (data) => {
      const { workerName, amount, date } = data;
      return `Hi ${workerName}, your payroll of $${amount} has been processed and will be deposited on ${date}. Thank you for working with ORBIT!`;
    }
  },
  assignment_notification: {
    name: 'assignment_notification',
    subject: 'New Assignment Available',
    template: (data) => {
      const { position, location, startTime, pay } = data;
      return `New ${position} assignment available at ${location} starting ${startTime} at $${pay}/hr. Quick-accept through the ORBIT app now!`;
    }
  },
  garnishment_alert: {
    name: 'garnishment_alert',
    subject: 'Garnishment Order Processed',
    template: (data) => {
      const { workerName, amount, caseNumber } = data;
      return `Hi ${workerName}, a garnishment order (Case #${caseNumber}) has been processed for $${amount}. This will be deducted from your next payroll.`;
    }
  },
  safety_alert: {
    name: 'safety_alert',
    subject: 'Safety Alert',
    template: (data) => {
      const { companyName, message } = data;
      return `SAFETY ALERT from ${companyName}: ${message}. Please respond immediately if you can help.`;
    }
  },
  general_notification: {
    name: 'general_notification',
    subject: 'ORBIT Notification',
    template: (data) => {
      const { message } = data;
      return `ORBIT: ${message}`;
    }
  }
};

export function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.log('[SMS] Twilio credentials not configured. SMS will be logged to console.');
      return null;
    }

    twilioClient = twilio(accountSid, authToken);
  }

  return twilioClient;
}

export function getSMSTemplates(): SMSTemplate[] {
  return Object.values(SMS_TEMPLATES);
}

export async function sendSMS(
  phoneNumber: string,
  message: string,
  messageType: string = 'general_notification'
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  try {
    const client = getTwilioClient();

    if (!client) {
      console.log(`[SMS QUEUED] Type: ${messageType}, Phone: ${phoneNumber}, Message: ${message}`);
      return { success: true, messageSid: 'QUEUED_NO_TWILIO' };
    }

    const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
    if (!twilioPhoneNumber) {
      console.error('TWILIO_PHONE_NUMBER not configured');
      return { success: false, error: 'Twilio phone number not configured' };
    }

    const response = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: phoneNumber,
    });

    console.log(`[SMS SENT] SID: ${response.sid}, Type: ${messageType}, To: ${phoneNumber}`);
    return { success: true, messageSid: response.sid };
  } catch (error: any) {
    console.error('Twilio SMS Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendSMSFromTemplate(
  phoneNumber: string,
  templateType: SMSTemplateType,
  data: Record<string, any>
): Promise<{ success: boolean; messageSid?: string; error?: string }> {
  try {
    const template = SMS_TEMPLATES[templateType];
    if (!template) {
      return { success: false, error: `Invalid template type: ${templateType}` };
    }

    const message = template.template(data);
    return sendSMS(phoneNumber, message, templateType);
  } catch (error: any) {
    console.error('SMS Template Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getSMSStatus(messageSid: string): Promise<string | null> {
  try {
    const client = getTwilioClient();
    if (!client) return null;

    const message = await client.messages(messageSid).fetch();
    return message.status;
  } catch (error: any) {
    console.error('Error fetching SMS status:', error.message);
    return null;
  }
}
