import { getUncachableStripeClient } from './stripeClient';

interface ProductConfig {
  name: string;
  description: string;
  price: number;
  metadata: Record<string, string>;
  type: 'tool' | 'bundle';
}

const STANDALONE_TOOLS: ProductConfig[] = [
  {
    name: 'ORBIT CRM',
    description: 'Complete customer relationship management with deal pipeline, activity tracking, meeting scheduler, and email analytics.',
    price: 1900, // $19.00
    metadata: {
      tier: 'tool',
      tool_id: 'crm',
      features: 'Deal pipeline,Activity timeline,Meeting scheduler,Email tracking,Duplicate detection,Notes & tasks,Unlimited contacts',
      competitor: 'HubSpot',
      savings: '62% less than HubSpot'
    },
    type: 'tool'
  },
  {
    name: 'ORBIT Talent Exchange',
    description: 'Job board and talent pool management with smart matching, application tracking, and Indeed-style search.',
    price: 2900, // $29.00
    metadata: {
      tier: 'tool',
      tool_id: 'talent',
      features: 'Unlimited job postings,Talent pool database,Smart job matching,Application tracking,Candidate messaging,Skills verification,Indeed-style search',
      competitor: 'Indeed',
      savings: '93% less than Indeed'
    },
    type: 'tool'
  },
  {
    name: 'ORBIT Payroll',
    description: 'Automated multi-state payroll processing with garnishment support, direct deposit, and prevailing wage compliance.',
    price: 3900, // $39.00
    metadata: {
      tier: 'tool',
      tool_id: 'payroll',
      features: 'Unlimited employees,Multi-state tax compliance,Garnishment processing,Direct deposit,Paystub generation,Prevailing wage support,Automated calculations',
      competitor: 'ADP',
      savings: '60-80% less than ADP'
    },
    type: 'tool'
  },
  {
    name: 'ORBIT Time & GPS',
    description: 'GPS-verified clock-in/out with geofencing, timesheet management, and photo verification.',
    price: 1500, // $15.00
    metadata: {
      tier: 'tool',
      tool_id: 'time',
      features: 'GPS geofencing (200-300ft),Mobile clock-in/out,Timesheet management,Overtime calculations,Break tracking,Photo verification,Real-time location',
      competitor: 'Deputy',
      savings: 'Flat rate pricing'
    },
    type: 'tool'
  },
  {
    name: 'ORBIT Compliance',
    description: 'I-9 verification, certification tracking, background checks, and drug testing management.',
    price: 2500, // $25.00
    metadata: {
      tier: 'tool',
      tool_id: 'compliance',
      features: 'I-9 verification tracking,Certification management,Expiration alerts,Document storage,Background check integration,Drug testing tracking,Audit-ready reports',
      competitor: 'Checkr',
      savings: 'Unlimited tracking included'
    },
    type: 'tool'
  }
];

const PLATFORM_BUNDLES: ProductConfig[] = [
  {
    name: 'ORBIT Starter Bundle',
    description: 'Essential tools for small teams (1-25 workers). Includes CRM, Time & GPS, and Compliance.',
    price: 9900, // $99.00
    metadata: {
      tier: 'bundle',
      bundle_id: 'starter',
      workers: '1-25',
      includes: 'crm,time,compliance',
      features: 'ORBIT CRM ($19 value),ORBIT Time & GPS ($15 value),ORBIT Compliance ($25 value),Employee Hub access,Basic reporting,Email support',
      savings: 'Save $28/mo vs individual tools'
    },
    type: 'bundle'
  },
  {
    name: 'ORBIT Growth Bundle',
    description: 'Everything for growing agencies (25-100 workers). All Starter features plus Talent Exchange and Payroll.',
    price: 14900, // $149.00
    metadata: {
      tier: 'bundle',
      bundle_id: 'growth',
      workers: '25-100',
      includes: 'crm,time,compliance,talent,payroll',
      features: 'All Starter features,ORBIT Talent Exchange ($29 value),ORBIT Payroll ($39 value),Owner Hub access,Advanced analytics,Priority support',
      savings: 'Save $48/mo vs individual tools',
      featured: 'true'
    },
    type: 'bundle'
  },
  {
    name: 'ORBIT Professional Bundle',
    description: 'Full platform for scaling operations (100-500 workers). Multi-location, API access, and white-label options.',
    price: 24900, // $249.00
    metadata: {
      tier: 'bundle',
      bundle_id: 'professional',
      workers: '100-500',
      includes: 'crm,time,compliance,talent,payroll,weather,api',
      features: 'All Growth features,Multi-location management,Full API access,White-label options,Weather verification,Dedicated support',
      savings: 'Save $78/mo vs individual tools'
    },
    type: 'bundle'
  }
];

async function seedProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('========================================');
  console.log('   ORBIT Staffing OS - Stripe Setup    ');
  console.log('========================================\n');

  const createdProducts: { [key: string]: { productId: string; priceId: string } } = {};

  try {
    console.log('📦 Creating Standalone Tools...\n');
    
    for (const tool of STANDALONE_TOOLS) {
      console.log(`Creating ${tool.name}...`);
      
      const product = await stripe.products.create({
        name: tool.name,
        description: tool.description,
        metadata: tool.metadata,
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: tool.price,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { 
          tier: 'tool',
          tool_id: tool.metadata.tool_id 
        },
      });

      createdProducts[tool.metadata.tool_id] = {
        productId: product.id,
        priceId: price.id
      };

      console.log(`  ✓ ${tool.name}: $${tool.price / 100}/mo (${price.id})\n`);
    }

    console.log('\n📦 Creating Platform Bundles...\n');

    for (const bundle of PLATFORM_BUNDLES) {
      console.log(`Creating ${bundle.name}...`);
      
      const product = await stripe.products.create({
        name: bundle.name,
        description: bundle.description,
        metadata: bundle.metadata,
      });

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: bundle.price,
        currency: 'usd',
        recurring: { interval: 'month' },
        metadata: { 
          tier: 'bundle',
          bundle_id: bundle.metadata.bundle_id 
        },
      });

      createdProducts[bundle.metadata.bundle_id] = {
        productId: product.id,
        priceId: price.id
      };

      console.log(`  ✓ ${bundle.name}: $${bundle.price / 100}/mo (${price.id})\n`);
    }

    console.log('\n========================================');
    console.log('       STRIPE PRICE IDs SUMMARY        ');
    console.log('========================================\n');

    console.log('STANDALONE TOOLS:');
    console.log(`  CRM ($19):        ${createdProducts.crm?.priceId}`);
    console.log(`  Talent ($29):     ${createdProducts.talent?.priceId}`);
    console.log(`  Payroll ($39):    ${createdProducts.payroll?.priceId}`);
    console.log(`  Time/GPS ($15):   ${createdProducts.time?.priceId}`);
    console.log(`  Compliance ($25): ${createdProducts.compliance?.priceId}`);
    
    console.log('\nPLATFORM BUNDLES:');
    console.log(`  Starter ($99):      ${createdProducts.starter?.priceId}`);
    console.log(`  Growth ($149):      ${createdProducts.growth?.priceId}`);
    console.log(`  Professional ($249): ${createdProducts.professional?.priceId}`);

    console.log('\n========================================');
    console.log('  UPDATE PRICING.TSX WITH THESE IDs:   ');
    console.log('========================================\n');

    console.log(`const STANDALONE_TOOLS: StandaloneTool[] = [
  { id: 'crm', ..., priceId: '${createdProducts.crm?.priceId}' },
  { id: 'talent', ..., priceId: '${createdProducts.talent?.priceId}' },
  { id: 'payroll', ..., priceId: '${createdProducts.payroll?.priceId}' },
  { id: 'time', ..., priceId: '${createdProducts.time?.priceId}' },
  { id: 'compliance', ..., priceId: '${createdProducts.compliance?.priceId}' },
];

const PLATFORM_BUNDLES: PlatformBundle[] = [
  { id: 'starter', ..., priceId: '${createdProducts.starter?.priceId}' },
  { id: 'growth', ..., priceId: '${createdProducts.growth?.priceId}' },
  { id: 'professional', ..., priceId: '${createdProducts.professional?.priceId}' },
];`);

    console.log('\n✅ All Stripe products created successfully!');
    console.log('📝 Products are now available in your Stripe Dashboard.');
    console.log('🔗 Webhook events will sync to your database automatically.\n');

  } catch (error) {
    console.error('❌ Error creating products:', error);
    process.exit(1);
  }
}

seedProducts();
