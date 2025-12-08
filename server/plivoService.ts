const PLIVO_API_URL = 'https://api.plivo.com/v1/Account';

export type SMSTemplateType = 
  | 'payroll_alert' 
  | 'assignment_notification' 
  | 'garnishment_alert' 
  | 'safety_alert' 
  | 'shift_reminder'
  | 'clock_in_reminder'
  | 'general_notification';

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
      return `Hi ${workerName}, your payroll of $${amount} has been processed and will be deposited on ${date}. Thank you for working with us!`;
    }
  },
  assignment_notification: {
    name: 'assignment_notification',
    subject: 'New Assignment Available',
    template: (data) => {
      const { position, location, startTime, pay } = data;
      return `New ${position} assignment available at ${location} starting ${startTime} at $${pay}/hr. Accept now through the app!`;
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
  shift_reminder: {
    name: 'shift_reminder',
    subject: 'Shift Reminder',
    template: (data) => {
      const { workerName, location, startTime, position } = data;
      return `Hi ${workerName}, reminder: Your ${position} shift at ${location} starts at ${startTime}. Don't forget to clock in!`;
    }
  },
  clock_in_reminder: {
    name: 'clock_in_reminder',
    subject: 'Clock In Reminder',
    template: (data) => {
      const { workerName, location } = data;
      return `Hi ${workerName}, you're at ${location} but haven't clocked in yet. Please clock in now to start tracking your hours.`;
    }
  },
  general_notification: {
    name: 'general_notification',
    subject: 'Notification',
    template: (data) => {
      const { message } = data;
      return message;
    }
  }
};

function getPlivoCredentials() {
  const authId = process.env.PLIVO_AUTH_ID;
  const authToken = process.env.PLIVO_AUTH_TOKEN;
  const phoneNumber = process.env.PLIVO_PHONE_NUMBER;
  
  if (!authId || !authToken) {
    return null;
  }
  
  return { authId, authToken, phoneNumber };
}

export function isPlivoConfigured(): boolean {
  const creds = getPlivoCredentials();
  return creds !== null && !!creds.phoneNumber;
}

export function getSMSTemplates(): SMSTemplate[] {
  return Object.values(SMS_TEMPLATES);
}

export async function sendSMS(
  phoneNumber: string,
  message: string,
  messageType: string = 'general_notification'
): Promise<{ success: boolean; messageUuid?: string; error?: string }> {
  try {
    const creds = getPlivoCredentials();
    
    if (!creds) {
      console.log(`[SMS QUEUED - Plivo not configured] Type: ${messageType}, Phone: ${phoneNumber}, Message: ${message}`);
      return { success: true, messageUuid: 'QUEUED_NO_PLIVO' };
    }
    
    if (!creds.phoneNumber) {
      console.error('[Plivo] PLIVO_PHONE_NUMBER not configured');
      return { success: false, error: 'Plivo phone number not configured' };
    }
    
    const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+1${phoneNumber.replace(/\D/g, '')}`;
    const formattedFrom = creds.phoneNumber.startsWith('+') ? creds.phoneNumber : `+1${creds.phoneNumber.replace(/\D/g, '')}`;
    
    const url = `${PLIVO_API_URL}/${creds.authId}/Message/`;
    const auth = Buffer.from(`${creds.authId}:${creds.authToken}`).toString('base64');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        src: formattedFrom,
        dst: formattedPhone,
        text: message
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Plivo] SMS Error:', data);
      return { success: false, error: data.error || 'Failed to send SMS' };
    }
    
    const messageUuid = data.message_uuid?.[0] || data.message_uuid;
    console.log(`[SMS SENT via Plivo] UUID: ${messageUuid}, Type: ${messageType}, To: ${formattedPhone}`);
    return { success: true, messageUuid };
    
  } catch (error: any) {
    console.error('[Plivo] SMS Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function sendSMSFromTemplate(
  phoneNumber: string,
  templateType: SMSTemplateType,
  data: Record<string, any>
): Promise<{ success: boolean; messageUuid?: string; error?: string }> {
  try {
    const template = SMS_TEMPLATES[templateType];
    if (!template) {
      return { success: false, error: `Invalid template type: ${templateType}` };
    }
    
    const message = template.template(data);
    return sendSMS(phoneNumber, message, templateType);
  } catch (error: any) {
    console.error('[Plivo] SMS Template Error:', error.message);
    return { success: false, error: error.message };
  }
}

export async function getSMSStatus(messageUuid: string): Promise<string | null> {
  try {
    const creds = getPlivoCredentials();
    if (!creds) return null;
    
    const url = `${PLIVO_API_URL}/${creds.authId}/Message/${messageUuid}/`;
    const auth = Buffer.from(`${creds.authId}:${creds.authToken}`).toString('base64');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`
      }
    });
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data.message_state || null;
  } catch (error: any) {
    console.error('[Plivo] Error fetching SMS status:', error.message);
    return null;
  }
}

export async function sendBulkSMS(
  phoneNumbers: string[],
  message: string,
  messageType: string = 'general_notification'
): Promise<{ success: boolean; messageUuid?: string; error?: string }> {
  try {
    const creds = getPlivoCredentials();
    
    if (!creds || !creds.phoneNumber) {
      console.log(`[BULK SMS QUEUED - Plivo not configured] Type: ${messageType}, Recipients: ${phoneNumbers.length}`);
      return { success: true, messageUuid: 'QUEUED_NO_PLIVO' };
    }
    
    const formattedNumbers = phoneNumbers
      .map(p => p.startsWith('+') ? p : `+1${p.replace(/\D/g, '')}`)
      .join('<');
    
    const formattedFrom = creds.phoneNumber.startsWith('+') ? creds.phoneNumber : `+1${creds.phoneNumber.replace(/\D/g, '')}`;
    
    const url = `${PLIVO_API_URL}/${creds.authId}/Message/`;
    const auth = Buffer.from(`${creds.authId}:${creds.authToken}`).toString('base64');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        src: formattedFrom,
        dst: formattedNumbers,
        text: message
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('[Plivo] Bulk SMS Error:', data);
      return { success: false, error: data.error || 'Failed to send bulk SMS' };
    }
    
    console.log(`[BULK SMS SENT via Plivo] Recipients: ${phoneNumbers.length}, Type: ${messageType}`);
    return { success: true, messageUuid: data.message_uuid?.[0] };
    
  } catch (error: any) {
    console.error('[Plivo] Bulk SMS Error:', error.message);
    return { success: false, error: error.message };
  }
}
