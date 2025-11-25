// Coinbase Commerce API wrapper
let coinbaseClient: any = null;

export function getCoinbaseClient() {
  if (!coinbaseClient) {
    const apiKey = process.env.COINBASE_API_KEY || process.env.COINBASE_COMMERCE_API_KEY;
    if (!apiKey) {
      console.warn('COINBASE_API_KEY not set - Coinbase payments disabled');
      return null;
    }
    // Coinbase Commerce client initialized with API key
    // Using REST API endpoints directly
    coinbaseClient = { apiKey };
  }
  return coinbaseClient;
}

export class CoinbaseService {
  async createCharge(email: string, amount: number, currency: string, description: string) {
    const client = getCoinbaseClient();
    if (!client) throw new Error('Coinbase service not configured');

    // For now, return a mock charge object
    // In production, call Coinbase API
    const chargeId = 'charge_' + Math.random().toString(36).substr(2, 9).toUpperCase();
    
    return {
      id: chargeId,
      email,
      amount: amount.toString(),
      currency,
      description,
      status: 'NEW',
      created_at: new Date().toISOString(),
      hosted_url: `https://commerce.coinbase.com/charges/${chargeId}`,
    };
  }

  async getCharge(chargeId: string) {
    // Placeholder
    return { id: chargeId, status: 'COMPLETED' };
  }

  async listCharges() {
    // Placeholder
    return { data: [] };
  }
}

export const coinbaseService = new CoinbaseService();
