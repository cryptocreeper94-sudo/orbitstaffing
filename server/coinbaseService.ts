// Coinbase Commerce service stub — activates when COINBASE_COMMERCE_API_KEY is set

class CoinbaseService {
  isConfigured(): boolean {
    return !!process.env.COINBASE_COMMERCE_API_KEY;
  }

  async createCharge(params: {
    name: string;
    description: string;
    amount: number;
    currency?: string;
    metadata?: Record<string, any>;
  }): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('Coinbase Commerce not configured');
    }
    
    const response = await fetch('https://api.commerce.coinbase.com/charges', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY!,
        'X-CC-Version': '2018-03-22',
      },
      body: JSON.stringify({
        name: params.name,
        description: params.description,
        pricing_type: 'fixed_price',
        local_price: {
          amount: params.amount.toFixed(2),
          currency: params.currency || 'USD',
        },
        metadata: params.metadata || {},
      }),
    });

    const data = await response.json();
    return data.data;
  }

  async getCharge(chargeCode: string): Promise<any> {
    const response = await fetch(`https://api.commerce.coinbase.com/charges/${chargeCode}`, {
      headers: {
        'X-CC-Api-Key': process.env.COINBASE_COMMERCE_API_KEY!,
        'X-CC-Version': '2018-03-22',
      },
    });
    const data = await response.json();
    return data.data;
  }

  getChargeStatus(charge: any): string {
    if (!charge?.timeline) return 'UNKNOWN';
    const latest = charge.timeline[charge.timeline.length - 1];
    return latest?.status || 'PENDING';
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    if (!process.env.COINBASE_WEBHOOK_SECRET) return false;
    const crypto = require('crypto');
    const expectedSig = crypto
      .createHmac('sha256', process.env.COINBASE_WEBHOOK_SECRET)
      .update(JSON.stringify(payload))
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig));
  }

  parseWebhookEvent(body: any): any {
    return body?.event || body;
  }
}

export const coinbaseService = new CoinbaseService();
