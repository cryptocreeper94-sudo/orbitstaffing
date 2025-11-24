import { getUncachableStripeClient } from './stripeClient';

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating ORBIT Staffing pricing plans...\n');

  try {
    // Solo/Micro Product
    console.log('Creating Solo/Micro plan...');
    const soloProduct = await stripe.products.create({
      name: 'ORBIT Solo/Micro',
      description: 'Staffing platform for 1-25 workers. Perfect for just starting out.',
      metadata: {
        tier: 'solo',
        workers: '1-25',
        features: 'Job posting,Mobile tracking,1-2 clients,Basic payroll,Email support',
      },
    });

    const soloPrice = await stripe.prices.create({
      product: soloProduct.id,
      unit_amount: 19900, // $199.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: 'solo' },
    });
    console.log(`✓ Solo price created: ${soloPrice.id}\n`);

    // Small Agency Product
    console.log('Creating Small Agency plan...');
    const smallProduct = await stripe.products.create({
      name: 'ORBIT Small Agency',
      description: 'Complete staffing platform for 25-150 workers. Like Superior Staffing.',
      metadata: {
        tier: 'small',
        workers: '25-150',
        features: 'Everything in Solo,Unlimited clients,Full payroll,GPS verification,Compliance reports,Priority support',
      },
    });

    const smallPrice = await stripe.prices.create({
      product: smallProduct.id,
      unit_amount: 49900, // $499.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: 'small' },
    });
    console.log(`✓ Small price created: ${smallPrice.id}\n`);

    // Growth Agency Product
    console.log('Creating Growth Agency plan...');
    const growthProduct = await stripe.products.create({
      name: 'ORBIT Growth Agency',
      description: 'Multi-location staffing platform for 150-500 workers.',
      metadata: {
        tier: 'growth',
        workers: '150-500',
        features: 'Everything in Small,Multi-location,Advanced analytics,Custom integrations,Dedicated support,API access',
      },
    });

    const growthPrice = await stripe.prices.create({
      product: growthProduct.id,
      unit_amount: 99900, // $999.00
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { tier: 'growth' },
    });
    console.log(`✓ Growth price created: ${growthPrice.id}\n`);

    // Summary
    console.log('\n========== STRIPE PRODUCT IDs ==========');
    console.log(`Solo Product ID: ${soloProduct.id}`);
    console.log(`Solo Price ID: ${soloPrice.id}`);
    console.log();
    console.log(`Small Product ID: ${smallProduct.id}`);
    console.log(`Small Price ID: ${smallPrice.id}`);
    console.log();
    console.log(`Growth Product ID: ${growthProduct.id}`);
    console.log(`Growth Price ID: ${growthPrice.id}`);
    console.log('\n========================================');

    console.log('\nUpdate Pricing.tsx with these price IDs:');
    console.log(`
    {
      id: 'solo',
      priceId: '${soloPrice.id}',
    },
    {
      id: 'small',
      priceId: '${smallPrice.id}',
    },
    {
      id: 'growth',
      priceId: '${growthPrice.id}',
    },
    `);

    console.log('\n✅ Stripe products created successfully!');
    console.log('Products are now syncing to your database...');
  } catch (error) {
    console.error('Error creating products:', error);
    process.exit(1);
  }
}

seedProducts();
