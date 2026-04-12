// Twilio SMS service stub — will use real Twilio when TWILIO_ACCOUNT_SID is configured

export async function sendSMS(to: string, body: string): Promise<{ success: boolean; sid?: string }> {
  if (!process.env.TWILIO_ACCOUNT_SID) {
    console.log(`[twilio] SMS stub (no credentials): to=${to}, body=${body.substring(0, 50)}...`);
    return { success: true, sid: `stub-${Date.now()}` };
  }
  
  try {
    const twilio = await import('twilio');
    const client = twilio.default(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    const message = await client.messages.create({
      body,
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
    });
    return { success: true, sid: message.sid };
  } catch (error: any) {
    console.error('[twilio] SMS send failed:', error.message);
    return { success: false };
  }
}

export async function sendSMSFromTemplate(
  to: string,
  template: string,
  variables: Record<string, string> = {}
): Promise<{ success: boolean; sid?: string }> {
  let body = template;
  for (const [key, value] of Object.entries(variables)) {
    body = body.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }
  return sendSMS(to, body);
}
