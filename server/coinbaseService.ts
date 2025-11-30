// Coinbase Commerce API Integration for Crypto Invoice Payments
// Documentation: https://docs.cloud.coinbase.com/commerce/reference

import { createHmac, timingSafeEqual } from 'crypto';

const COINBASE_API_URL = 'https://api.commerce.coinbase.com';

interface CoinbaseCharge {
  id: string;
  code: string;
  name: string;
  description: string;
  pricing_type: 'fixed_price' | 'no_price';
  pricing: {
    local: { amount: string; currency: string };
    [key: string]: { amount: string; currency: string };
  };
  addresses: {
    bitcoin?: string;
    ethereum?: string;
    litecoin?: string;
    usdc?: string;
    dai?: string;
  };
  timeline: Array<{
    status: string;
    time: string;
  }>;
  hosted_url: string;
  created_at: string;
  expires_at: string;
  confirmed_at?: string;
  payments: Array<{
    network: string;
    transaction_id: string;
    status: string;
    value: { amount: string; currency: string };
  }>;
}

interface CreateChargeParams {
  name: string;
  description: string;
  amount: string;
  currency: string;
  metadata?: Record<string, string>;
  redirect_url?: string;
  cancel_url?: string;
}

function getApiKey(): string | null {
  return process.env.COINBASE_COMMERCE_API_KEY || process.env.COINBASE_API_KEY || null;
}

export class CoinbaseService {
  private apiKey: string | null;

  constructor() {
    this.apiKey = getApiKey();
    if (!this.apiKey) {
      console.warn('[Coinbase] API key not configured - crypto payments disabled');
    }
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: Record<string, any>
  ): Promise<T> {
    if (!this.apiKey) {
      throw new Error('Coinbase Commerce API key not configured');
    }

    const response = await fetch(`${COINBASE_API_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': this.apiKey,
        'X-CC-Version': '2018-03-22',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[Coinbase] API error: ${response.status}`, error);
      throw new Error(`Coinbase API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async createCharge(params: CreateChargeParams): Promise<CoinbaseCharge> {
    console.log('[Coinbase] Creating charge:', params.name, params.amount, params.currency);
    
    const response = await this.request<{ data: CoinbaseCharge }>('/charges', 'POST', {
      name: params.name,
      description: params.description,
      pricing_type: 'fixed_price',
      local_price: {
        amount: params.amount,
        currency: params.currency,
      },
      metadata: params.metadata || {},
      redirect_url: params.redirect_url,
      cancel_url: params.cancel_url,
    });

    console.log('[Coinbase] Charge created:', response.data.code);
    return response.data;
  }

  async getCharge(chargeCode: string): Promise<CoinbaseCharge> {
    const response = await this.request<{ data: CoinbaseCharge }>(`/charges/${chargeCode}`);
    return response.data;
  }

  async listCharges(limit: number = 25): Promise<CoinbaseCharge[]> {
    const response = await this.request<{ data: CoinbaseCharge[] }>(`/charges?limit=${limit}`);
    return response.data;
  }

  async cancelCharge(chargeCode: string): Promise<CoinbaseCharge> {
    const response = await this.request<{ data: CoinbaseCharge }>(`/charges/${chargeCode}/cancel`, 'POST');
    return response.data;
  }

  getChargeStatus(charge: CoinbaseCharge): 'pending' | 'completed' | 'expired' | 'failed' {
    const latestStatus = charge.timeline[charge.timeline.length - 1]?.status;
    
    switch (latestStatus) {
      case 'COMPLETED':
      case 'RESOLVED':
        return 'completed';
      case 'EXPIRED':
      case 'CANCELED':
        return 'expired';
      case 'UNRESOLVED':
        return 'failed';
      default:
        return 'pending';
    }
  }

  verifyWebhookSignature(payload: string, signature: string, webhookSecret: string): boolean {
    const computedSignature = createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');
    
    return timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  }

  parseWebhookEvent(body: any): {
    type: string;
    chargeCode: string;
    chargeId: string;
    invoiceId?: string;
    status: string;
  } {
    const event = body.event;
    return {
      type: event.type,
      chargeCode: event.data.code,
      chargeId: event.data.id,
      invoiceId: event.data.metadata?.invoiceId,
      status: this.getChargeStatus(event.data),
    };
  }
}

export const coinbaseService = new CoinbaseService();

export function getCoinbaseClient() {
  return coinbaseService.isConfigured() ? coinbaseService : null;
}
