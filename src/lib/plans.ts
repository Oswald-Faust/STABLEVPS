// Plan configuration - Can be imported by both client and server components
// Prices are in EUR, matching Zomro Cloud Forex plans with margin
export const PLANS = {
  basic: {
    id: 'basic',
    name: 'Starter',
    monthlyPrice: 12.49,
    yearlyPrice: 124.90, // ~2 months free
    platforms: '1-2',
    specs: {
      cpu: '1 vCPU',
      ram: '2.5 GB',
      storage: '17 GB NVMe',
      os: 'Windows Server 2022'
    }
  },
  prime: {
    id: 'prime',
    name: 'Professional',
    monthlyPrice: 19.49,
    yearlyPrice: 194.90, // ~2 months free
    platforms: '2-4',
    specs: {
      cpu: '2 vCPU',
      ram: '4 GB',
      storage: '35 GB NVMe',
      os: 'Windows Server 2022'
    }
  },
  pro: {
    id: 'pro',
    name: 'Enterprise',
    monthlyPrice: 34.49,
    yearlyPrice: 344.90, // ~2 months free
    platforms: '4-8+',
    specs: {
      cpu: '4 vCPU',
      ram: '8 GB',
      storage: '65 GB NVMe',
      os: 'Windows Server 2022'
    }
  }
} as const;

export type PlanId = keyof typeof PLANS;
export type BillingCycle = 'monthly' | 'yearly';

export function getPlanPrice(planId: PlanId, billingCycle: BillingCycle): number {
  const plan = PLANS[planId];
  return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
}
