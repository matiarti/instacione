import connectDB from '../lib/mongodb';
import SubscriptionPlan from '../models/SubscriptionPlan';

const subscriptionPlans = [
  {
    name: 'Starter',
    description: 'Perfect for small parking lots',
    price: 2990, // R$ 29.90 in cents
    currency: 'BRL',
    features: [
      'Up to 2 parking lots',
      '100 reservations per month',
      'Basic analytics',
      'Email support'
    ],
    maxParkingLots: 2,
    maxReservationsPerMonth: 100,
    stripePriceId: 'price_starter_monthly',
    isActive: true,
  },
  {
    name: 'Professional',
    description: 'Ideal for growing businesses',
    price: 5990, // R$ 59.90 in cents
    currency: 'BRL',
    features: [
      'Up to 10 parking lots',
      '1,000 reservations per month',
      'Advanced analytics',
      'Priority support',
      'Custom branding'
    ],
    maxParkingLots: 10,
    maxReservationsPerMonth: 1000,
    stripePriceId: 'price_pro_monthly',
    isActive: true,
  },
  {
    name: 'Enterprise',
    description: 'For large parking operations',
    price: 9990, // R$ 99.90 in cents
    currency: 'BRL',
    features: [
      'Unlimited parking lots',
      'Unlimited reservations',
      'Full analytics suite',
      '24/7 phone support',
      'Custom integrations',
      'Dedicated account manager'
    ],
    maxParkingLots: -1, // -1 means unlimited
    maxReservationsPerMonth: -1, // -1 means unlimited
    stripePriceId: 'price_enterprise_monthly',
    isActive: true,
  },
];

async function seedSubscriptionPlans() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    
    console.log('Clearing existing subscription plans...');
    await SubscriptionPlan.deleteMany({});
    
    console.log('Creating subscription plans...');
    const createdPlans = await SubscriptionPlan.insertMany(subscriptionPlans);
    
    console.log(`Successfully created ${createdPlans.length} subscription plans:`);
    createdPlans.forEach(plan => {
      console.log(`- ${plan.name}: R$ ${(plan.price / 100).toFixed(2)}/month`);
    });
    
    console.log('Subscription plans seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding subscription plans:', error);
    process.exit(1);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedSubscriptionPlans();
}

export default seedSubscriptionPlans;
