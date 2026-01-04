import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as any,
});

async function main() {
  const domain = process.env.REPLIT_DOMAINS?.split(',')[0];
  const webhookUrl = `https://${domain}/api/stripe/developer-webhook`;
  
  console.log('=== STRIPE ACCOUNT INFO ===');
  
  // List existing webhooks
  console.log('\n--- Existing Webhooks ---');
  const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
  for (const wh of webhooks.data) {
    console.log(`ID: ${wh.id}`);
    console.log(`URL: ${wh.url}`);
    console.log(`Status: ${wh.status}`);
    console.log('---');
  }
  
  // List existing products
  console.log('\n--- Existing Products ---');
  const products = await stripe.products.list({ limit: 20, active: true });
  for (const prod of products.data) {
    console.log(`${prod.id}: ${prod.name}`);
  }
  
  // List existing prices
  console.log('\n--- Existing Prices ---');
  const prices = await stripe.prices.list({ limit: 20, active: true });
  for (const price of prices.data) {
    const amount = price.unit_amount ? (price.unit_amount / 100).toFixed(2) : 'N/A';
    const interval = price.recurring?.interval || 'one-time';
    console.log(`${price.id}: $${amount} (${interval}) - Product: ${price.product}`);
  }
  
  // Create new webhook
  console.log('\n--- Creating Webhook ---');
  console.log(`Target URL: ${webhookUrl}`);
  
  const existingWebhook = webhooks.data.find(wh => wh.url === webhookUrl);
  if (existingWebhook) {
    console.log(`Webhook already exists: ${existingWebhook.id}`);
  } else {
    const newWebhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events: [
        'checkout.session.completed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
        'invoice.payment_succeeded',
        'invoice.payment_failed',
        'payment_intent.succeeded',
        'payment_intent.payment_failed',
      ],
    });
    console.log(`Created webhook: ${newWebhook.id}`);
    console.log(`\n=== NEW WEBHOOK SECRET ===`);
    console.log(newWebhook.secret);
    console.log(`\n⚠️ Update STRIPE_WEBHOOK_SECRET with the secret above!`);
  }
}

main().catch(console.error);
