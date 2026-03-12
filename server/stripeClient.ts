import Stripe from 'stripe';

async function getCredentials() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;

  if (!secretKey || !publishableKey) {
    throw new Error('Stripe keys not configured. Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY.');
  }

  return { publishableKey, secretKey };
}

export async function getUncachableStripeClient() {
  const { secretKey } = await getCredentials();
  return new Stripe(secretKey, {
    apiVersion: '2024-11-20.acacia' as any,
  });
}

export async function getStripePublishableKey() {
  const { publishableKey } = await getCredentials();
  return publishableKey;
}
