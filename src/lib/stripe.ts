import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
  typescript: true,
});

// Plan configuration
export const PLANS = {
  basic: {
    id: 'basic',
    name: 'Basique',
    monthlyPrice: 29,
    yearlyPrice: 290,
    platforms: '1-3',
    specs: {
      cpu: '2 vCPU',
      ram: '4 GB',
      storage: '60 GB SSD',
      os: 'Windows Server'
    }
  },
  prime: {
    id: 'prime',
    name: 'Prime',
    monthlyPrice: 49,
    yearlyPrice: 490,
    platforms: '3-6',
    specs: {
      cpu: '4 vCPU',
      ram: '8 GB',
      storage: '120 GB SSD',
      os: 'Windows Server'
    }
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 89,
    yearlyPrice: 890,
    platforms: '6-10+',
    specs: {
      cpu: '6 vCPU',
      ram: '16 GB',
      storage: '200 GB NVMe',
      os: 'Windows Server'
    }
  }
} as const;

export type PlanId = keyof typeof PLANS;
export type BillingCycle = 'monthly' | 'yearly';

export function getPlanPrice(planId: PlanId, billingCycle: BillingCycle): number {
  const plan = PLANS[planId];
  return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
}
