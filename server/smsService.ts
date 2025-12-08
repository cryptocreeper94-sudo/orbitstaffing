import * as plivo from './plivoService';

export type SMSProvider = 'plivo' | 'twilio' | 'none';

export function getConfiguredProvider(): SMSProvider {
  if (process.env.PLIVO_AUTH_ID && process.env.PLIVO_AUTH_TOKEN && process.env.PLIVO_PHONE_NUMBER) {
    return 'plivo';
  }
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    return 'twilio';
  }
  return 'none';
}

export function getSMSProviderStatus(): {
  provider: SMSProvider;
  configured: boolean;
  phoneNumber?: string;
} {
  const provider = getConfiguredProvider();
  
  if (provider === 'plivo') {
    return {
      provider: 'plivo',
      configured: true,
      phoneNumber: process.env.PLIVO_PHONE_NUMBER
    };
  }
  
  if (provider === 'twilio') {
    return {
      provider: 'twilio',
      configured: true,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    };
  }
  
  return {
    provider: 'none',
    configured: false
  };
}

export async function sendSMS(
  phoneNumber: string,
  message: string,
  messageType: string = 'general_notification'
): Promise<{ success: boolean; messageId?: string; error?: string; provider: SMSProvider }> {
  const provider = getConfiguredProvider();
  
  if (provider === 'plivo') {
    const result = await plivo.sendSMS(phoneNumber, message, messageType);
    return {
      success: result.success,
      messageId: result.messageUuid,
      error: result.error,
      provider: 'plivo'
    };
  }
  
  if (provider === 'twilio') {
    const twilio = await import('./twilioService');
    const result = await twilio.sendSMS(phoneNumber, message, messageType);
    return {
      success: result.success,
      messageId: result.messageSid,
      error: result.error,
      provider: 'twilio'
    };
  }
  
  console.log(`[SMS QUEUED - No provider] Type: ${messageType}, Phone: ${phoneNumber}, Message: ${message}`);
  return {
    success: true,
    messageId: 'QUEUED_NO_PROVIDER',
    provider: 'none'
  };
}

export async function sendSMSFromTemplate(
  phoneNumber: string,
  templateType: plivo.SMSTemplateType,
  data: Record<string, any>
): Promise<{ success: boolean; messageId?: string; error?: string; provider: SMSProvider }> {
  const provider = getConfiguredProvider();
  
  if (provider === 'plivo') {
    const result = await plivo.sendSMSFromTemplate(phoneNumber, templateType, data);
    return {
      success: result.success,
      messageId: result.messageUuid,
      error: result.error,
      provider: 'plivo'
    };
  }
  
  if (provider === 'twilio') {
    const twilio = await import('./twilioService');
    const result = await twilio.sendSMSFromTemplate(phoneNumber, templateType as any, data);
    return {
      success: result.success,
      messageId: result.messageSid,
      error: result.error,
      provider: 'twilio'
    };
  }
  
  const templates = plivo.getSMSTemplates();
  const template = templates.find(t => t.name === templateType);
  if (template) {
    console.log(`[SMS QUEUED - No provider] Type: ${templateType}, Phone: ${phoneNumber}`);
  }
  
  return {
    success: true,
    messageId: 'QUEUED_NO_PROVIDER',
    provider: 'none'
  };
}

export async function sendBulkSMS(
  phoneNumbers: string[],
  message: string,
  messageType: string = 'general_notification'
): Promise<{ success: boolean; messageId?: string; error?: string; provider: SMSProvider }> {
  const provider = getConfiguredProvider();
  
  if (provider === 'plivo') {
    const result = await plivo.sendBulkSMS(phoneNumbers, message, messageType);
    return {
      success: result.success,
      messageId: result.messageUuid,
      error: result.error,
      provider: 'plivo'
    };
  }
  
  if (provider === 'twilio') {
    const results = await Promise.all(
      phoneNumbers.map(phone => sendSMS(phone, message, messageType))
    );
    const failed = results.filter(r => !r.success);
    return {
      success: failed.length === 0,
      messageId: results[0]?.messageId,
      error: failed.length > 0 ? `${failed.length} messages failed` : undefined,
      provider: 'twilio'
    };
  }
  
  console.log(`[BULK SMS QUEUED - No provider] Type: ${messageType}, Recipients: ${phoneNumbers.length}`);
  return {
    success: true,
    messageId: 'QUEUED_NO_PROVIDER',
    provider: 'none'
  };
}

export { SMSTemplateType } from './plivoService';
