"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Pricing() {
  const t = useTranslations('pricing');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      key: 'basic',
      monthlyPrice: 12.49,
      yearlyPrice: 124.90,
      platforms: "1-2",
      specs: {
        cpu: "1 vCPU",
        ram: "2.5 GB",
        storage: "17 GB NVMe",
        os: "Windows Server 2022"
      },
      featureKeys: ['latency5', 'ddos', 'autoLogon', 'rdp', 'supportStandard'],
      featured: false
    },
    {
      key: 'pro',
      monthlyPrice: 19.49,
      yearlyPrice: 194.90,
      platforms: "2-4",
      specs: {
        cpu: "2 vCPU",
        ram: "4 GB",
        storage: "35 GB NVMe",
        os: "Windows Server 2022"
      },
      featureKeys: ['latency2', 'ddosShield', 'autoLogon', 'rdp', 'dedicatedIp', 'backups', 'supportPriority'],
      featured: true
    },
    {
      key: 'prime',
      monthlyPrice: 34.49,
      yearlyPrice: 344.90,
      platforms: "4-8+",
      specs: {
        cpu: "4 vCPU",
        ram: "8 GB",
        storage: "65 GB NVMe",
        os: "Windows Server 2022"
      },
      featureKeys: ['latency1', 'ddosElite', 'autoLogon', 'rdp', 'dedicatedIp', 'backups', 'monitoring', 'supportVip', 'guaranteed'],
      featured: false
    }
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-black" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full filter blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-600/10 rounded-full filter blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">{t('badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('title')} <span className="gradient-text">{t('titleHighlight')}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            {t('subtitle')}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              {t('monthly')}
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-16 h-8 bg-gray-200 dark:bg-gray-800 rounded-full transition-colors"
              aria-label="Toggle billing cycle"
            >
              <div className={`absolute top-1 w-6 h-6 bg-green-500 rounded-full transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-9' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900 dark:text-white' : 'text-gray-500'}`}>
              {t('yearly')}
              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-600 dark:text-green-400 text-xs rounded-full">
                {t('discount')}
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`glass-card rounded-3xl p-8 relative flex flex-col ${
                plan.featured ? 'pricing-featured lg:scale-105' : ''
              }`}
            >
              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{t(`plans.${plan.key}.name`)}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t(`plans.${plan.key}.description`)}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold gradient-text">
                    {billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)}€
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">{t('perMonth')}</span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-green-400 mt-1">
                    {t('billedYearly', { price: plan.yearlyPrice })}
                  </p>
                )}
              </div>

              {/* Platforms */}
              <div className="flex items-center gap-2 mb-6 p-3 bg-gray-100 dark:bg-gray-900/50 rounded-xl">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <span className="text-gray-900 dark:text-white font-medium">{plan.platforms} {t('platforms')}</span>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-xl text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('specs.cpu')}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{plan.specs.cpu}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-xl text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('specs.ram')}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{plan.specs.ram}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-xl text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('specs.storage')}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{plan.specs.storage}</p>
                </div>
                <div className="p-3 bg-gray-100 dark:bg-gray-900/50 rounded-xl text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('specs.os')}</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{plan.specs.os}</p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.featureKeys.map((featureKey, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 text-sm">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {t(`features.${featureKey}`)}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href="/signup"
                className={`w-full py-4 rounded-xl font-semibold text-center block transition-all mt-auto ${
                  plan.featured
                    ? 'btn-primary justify-center'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {t('cta')}
              </Link>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-16 text-center">
          <p className="text-gray-400 text-sm mb-8 font-medium">{t('paymentMethods')}</p>
          <div className="flex flex-row items-center justify-center gap-3 sm:gap-6">
            {/* Apple Pay */}
            <div className="flex items-center justify-center px-4 sm:px-6 py-3 sm:py-4 bg-[#1a1a1a] rounded-xl sm:rounded-2xl border border-gray-600/50 hover:border-green-500/50 hover:bg-[#222] transition-all duration-300 gap-1 sm:gap-2 flex-1 max-w-[140px]">
              {/* Apple Logo */}
              <svg className="h-6 w-6 sm:h-8 sm:w-8" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              {/* Pay text */}
              <span className="text-white text-xl sm:text-2xl font-medium tracking-tight">Pay</span>
            </div>
            
            {/* Visa - avec fond blanc pour que les couleurs soient visibles */}
            <div className="flex items-center justify-center px-4 sm:px-8 py-3 sm:py-4 bg-white rounded-xl sm:rounded-2xl border border-gray-600/50 hover:border-green-500/50 transition-all duration-300 flex-1 max-w-[140px]">
              <svg className="h-8 sm:h-10 w-auto" viewBox="0 0 750 471" fill="none">
                <path d="M278.197 334.228l33.36-195.763h53.358l-33.384 195.763H278.197zm246.09-191.54c-10.57-3.966-27.135-8.222-47.82-8.222-52.725 0-89.863 26.55-90.18 64.603-.296 28.13 26.514 43.822 46.752 53.186 20.77 9.596 27.752 15.715 27.654 24.283-.133 13.123-16.586 19.116-31.922 19.116-21.357 0-32.703-2.967-50.225-10.276l-6.878-3.112-7.487 43.823c12.463 5.464 35.51 10.199 59.438 10.445 56.09 0 92.5-26.248 92.916-66.884.199-22.276-14.016-39.216-44.8-53.188-18.65-9.055-30.072-15.099-29.951-24.268 0-8.137 9.668-16.838 30.557-16.838 17.449-.27 30.09 3.535 39.938 7.5l4.781 2.26 7.227-42.428zm137.31-4.223h-41.232c-12.773 0-22.332 3.487-27.941 16.234l-79.244 179.402h56.031s9.16-24.122 11.232-29.418c6.125 0 60.555.084 68.336.084 1.596 6.853 6.49 29.334 6.49 29.334h49.512l-43.184-195.636zm-65.418 126.407c4.414-11.278 21.26-54.723 21.26-54.723-.317.522 4.379-11.334 7.074-18.693l3.605 16.879s10.219 46.729 12.354 56.537h-44.293zM209.17 138.465l-52.24 133.496-5.567-27.13c-9.725-31.273-40.025-65.157-73.898-82.118l47.766 171.203 56.456-.063 84.004-195.388h-56.52z" fill="#1A1F71"/>
                <path d="M131.92 138.465H45.879l-.682 4.073c66.938 16.205 111.232 55.363 129.618 102.416l-18.71-89.96c-3.23-12.395-12.597-16.094-24.186-16.529z" fill="#F9A533"/>
              </svg>
            </div>
            
            {/* Mastercard - avec fond blanc pour mieux voir les cercles */}
            <div className="flex items-center justify-center px-4 sm:px-8 py-3 sm:py-4 bg-[#1a1a1a] rounded-xl sm:rounded-2xl border border-gray-600/50 hover:border-green-500/50 hover:bg-[#222] transition-all duration-300 flex-1 max-w-[140px]">
              <svg className="h-8 sm:h-10 w-auto" viewBox="0 0 131.39 86.9" fill="none">
                <circle cx="43.45" cy="43.45" r="43.45" fill="#EB001B"/>
                <circle cx="87.94" cy="43.45" r="43.45" fill="#F79E1B"/>
                <path d="M65.69 16.68a43.3 43.3 0 0 0-16.4 26.77 43.3 43.3 0 0 0 16.4 26.77 43.3 43.3 0 0 0 16.4-26.77 43.3 43.3 0 0 0-16.4-26.77z" fill="#FF5F00"/>
              </svg>
            </div>
          </div>
          
          {/* Secure Payment Badge */}
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-full border border-green-500/20">
            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-green-400 text-xs font-medium">{t('securePayment') || 'Paiement 100% sécurisé'}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
