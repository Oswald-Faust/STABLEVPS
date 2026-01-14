import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
});

// Re-export plan configuration from plans.ts for backward compatibility
export { PLANS, getPlanPrice } from './plans';
export type { PlanId, BillingCycle } from './plans';

