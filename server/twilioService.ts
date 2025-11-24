import twilio from 'twilio';

let twilioClient: ReturnType<typeof twilio> | null = null;

export function getTwilioClient() {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
      console.warn('Twilio credentials not configured. SMS notifications will be queued but not sent.');
      return null;
    }

    twilioClient = twilio(accountSid, authToken);
  }

  return twilioClient;
}

export async function sendSMS(
  phoneNumber: string,
  message: string,
  messageType: string
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
