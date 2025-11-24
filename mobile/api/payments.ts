import { useMutation } from '@tanstack/react-query';
import { getAuthToken } from './auth';

interface CheckoutRequest {
  priceId: string;
  paymentMethod: 'stripe' | 'coinbase';
}

interface CheckoutResponse {
  url?: string;
  charge?: {
    id: string;
    hosted_url: string;
    status: string;
  };
  error?: string;
}

export function useStripePayment() {
  return useMutation({
    mutationFn: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
      const token = await getAuthToken();
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Stripe checkout failed');
      }

      return response.json();
    },
  });
}

export function useCoinbasePayment() {
  return useMutation({
    mutationFn: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
      const token = await getAuthToken();
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Coinbase checkout failed');
      }

      return response.json();
    },
  });
}

export async function getStripePrice(priceId: string) {
  const response = await fetch(`/api/prices?id=${priceId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch price');
  }
  return response.json();
}
