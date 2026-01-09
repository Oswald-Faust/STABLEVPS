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
      monthlyPrice: 29,
      yearlyPrice: 290,
      platforms: "1-3",
      specs: {
        cpu: "2 vCPU",
        ram: "4 GB",
        storage: "60 GB SSD",
        os: "Windows Server"
      },
      featureKeys: ['latency5', 'ddos', 'autoLogon', 'rdp', 'supportStandard'],
      featured: false
    },
    {
      key: 'prime',
      monthlyPrice: 49,
      yearlyPrice: 490,
      platforms: "3-6",
      specs: {
        cpu: "4 vCPU",
        ram: "8 GB",
        storage: "120 GB SSD",
        os: "Windows Server"
      },
      featureKeys: ['latency2', 'ddosShield', 'autoLogon', 'rdp', 'dedicatedIp', 'backups', 'supportPriority'],
      featured: true
    },
    {
      key: 'pro',
      monthlyPrice: 89,
      yearlyPrice: 890,
      platforms: "6-10+",
      specs: {
        cpu: "6 vCPU",
        ram: "16 GB",
        storage: "200 GB NVMe",
        os: "Windows Server"
      },
      featureKeys: ['latency1', 'ddosElite', 'autoLogon', 'rdp', 'dedicatedIp', 'backups', 'monitoring', 'supportVip', 'guaranteed'],
      featured: false
    }
  ];

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-500/10 rounded-full filter blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-green-600/10 rounded-full filter blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
            <span className="text-green-400 text-sm font-medium">{t('badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {t('title')} <span className="gradient-text">{t('titleHighlight')}</span>
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            {t('subtitle')}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>
              {t('monthly')}
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-16 h-8 bg-gray-800 rounded-full transition-colors"
              aria-label="Toggle billing cycle"
            >
              <div className={`absolute top-1 w-6 h-6 bg-green-500 rounded-full transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-9' : 'translate-x-1'
              }`} />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}>
              {t('yearly')}
              <span className="ml-2 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                {t('discount')}
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`glass-card rounded-3xl p-8 relative ${
                plan.featured ? 'pricing-featured lg:scale-105' : ''
              }`}
            >
              {/* Plan Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">{t(`plans.${plan.key}.name`)}</h3>
                <p className="text-gray-400 text-sm">{t(`plans.${plan.key}.description`)}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold gradient-text">
                    {billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12)}€
                  </span>
                  <span className="text-gray-400">{t('perMonth')}</span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-sm text-green-400 mt-1">
                    {t('billedYearly', { price: plan.yearlyPrice })}
                  </p>
                )}
              </div>

              {/* Platforms */}
              <div className="flex items-center gap-2 mb-6 p-3 bg-gray-900/50 rounded-xl">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
                <span className="text-white font-medium">{plan.platforms} {t('platforms')}</span>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 bg-gray-900/50 rounded-xl text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('specs.cpu')}</p>
                  <p className="text-sm font-semibold text-white">{plan.specs.cpu}</p>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-xl text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('specs.ram')}</p>
                  <p className="text-sm font-semibold text-white">{plan.specs.ram}</p>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-xl text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('specs.storage')}</p>
                  <p className="text-sm font-semibold text-white">{plan.specs.storage}</p>
                </div>
                <div className="p-3 bg-gray-900/50 rounded-xl text-center">
                  <p className="text-xs text-gray-500 mb-1">{t('specs.os')}</p>
                  <p className="text-sm font-semibold text-white">{plan.specs.os}</p>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.featureKeys.map((featureKey, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
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
                className={`w-full py-4 rounded-xl font-semibold text-center block transition-all ${
                  plan.featured
                    ? 'btn-primary justify-center'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                {t('cta')}
              </Link>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 text-sm mb-6">{t('paymentMethods')}</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {/* Visa */}
            <div className="flex items-center justify-center px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <svg className="h-6 w-auto" viewBox="0 0 48 16" fill="none">
                <path d="M17.545 1.031L11.454 14.969H7.545L4.545 4.094c-.182-.711-.341-1.025-.897-1.342-.909-.516-2.409-1-3.647-1.341v-.38H6.773c.909 0 1.727.606 1.909 1.655l1.637 8.689 4.045-10.344h3.181zm12.545 9.313c.014-3.656-5.054-3.858-5.022-5.492.009-.497.485-1.025 1.523-1.161.514-.068 1.933-.12 3.541.625l.631-2.947C29.949.999 28.772.594 27.318.594c-2.999 0-5.109 1.594-5.127 3.874-.018 1.688 1.509 2.63 2.659 3.192 1.182.576 1.577.945 1.572 1.46-.008.789-.941 1.137-1.814 1.15-1.522.023-2.409-.411-3.113-.74l-.549 2.569c.709.325 2.018.608 3.375.622 3.182 0 5.264-1.572 5.269-4.009zm7.91 4.625h2.8L38.318.594h-2.586c-.581 0-1.073.338-1.291.857L30.182 14.969h3.182l.632-1.75h3.886l.368 1.75zm-3.381-4.15l1.595-4.397.918 4.397h-2.513zM15.545.594l-2.5 14.375H10l2.5-14.375h3.045z" fill="#1434CB"/>
              </svg>
            </div>
            
            {/* Mastercard */}
            <div className="flex items-center justify-center px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <svg className="h-6 w-auto" viewBox="0 0 48 30" fill="none">
                <circle cx="18" cy="15" r="12" fill="#EB001B"/>
                <circle cx="30" cy="15" r="12" fill="#F79E1B"/>
                <path d="M24 22.5c2.5-2.1 4.1-5.3 4.1-8.85s-1.6-6.75-4.1-8.85c-2.5 2.1-4.1 5.3-4.1 8.85s1.6 6.75 4.1 8.85z" fill="#FF5F00"/>
              </svg>
            </div>
            
            {/* PayPal */}
            <div className="flex items-center justify-center px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <svg className="h-6 w-auto" viewBox="0 0 64 18" fill="none">
                <path d="M7.266 17.154H4.73L2.5 1.77h3.25l1.516 10.384L11.484 1.77h3.25l-4.219 15.384h-3.25zm10.468 0H14.5l2.063-7.5c.156-.563.234-.969.234-1.219 0-.375-.109-.656-.328-.844-.219-.188-.531-.281-.938-.281-.5 0-.969.141-1.406.422-.438.281-.797.656-1.078 1.125L10.75 17.154H7.5L10.75 5.5h2.969l-.313 1.219c.531-.469 1.109-.828 1.734-1.078.625-.25 1.281-.375 1.969-.375 1 0 1.781.281 2.344.844.563.563.844 1.328.844 2.297 0 .375-.078.844-.234 1.406l-2.329 7.341z" fill="#003087"/>
                <path d="M23.938 17.154h-3.25l2.063-7.5c.156-.563.234-.969.234-1.219 0-.375-.109-.656-.328-.844-.219-.188-.531-.281-.938-.281-.5 0-.969.141-1.406.422-.438.281-.797.656-1.078 1.125L16.938 17.154h-3.25L16.938 5.5h2.969l-.313 1.219c.531-.469 1.109-.828 1.734-1.078.625-.25 1.281-.375 1.969-.375 1 0 1.781.281 2.344.844.563.563.844 1.328.844 2.297 0 .375-.078.844-.234 1.406l-2.313 7.341zM31.188 17.154l.313-1.172c-.5.438-1.047.781-1.641 1.031-.594.25-1.203.375-1.828.375-1.156 0-2.062-.375-2.719-1.125-.656-.75-.984-1.75-.984-3 0-1.594.516-2.906 1.547-3.938 1.031-1.031 2.344-1.547 3.938-1.547.688 0 1.328.125 1.922.375.594.25 1.109.609 1.547 1.078l.391-1.219h3.094l-2.875 9.142h-2.705zm-1.266-2.578c.688 0 1.297-.234 1.828-.703.531-.469.891-1.078 1.078-1.828.063-.187.094-.375.094-.562 0-.5-.172-.906-.516-1.219-.344-.313-.797-.469-1.359-.469-.688 0-1.297.234-1.828.703-.531.469-.891 1.078-1.078 1.828-.063.25-.094.469-.094.656 0 .5.172.891.516 1.172.344.281.797.422 1.359.422z" fill="#003087"/>
                <path d="M38.438 17.388c-1.344 0-2.453-.406-3.328-1.219-.875-.813-1.312-1.875-1.312-3.188 0-1.5.531-2.75 1.594-3.75 1.063-1 2.406-1.5 4.031-1.5 1.344 0 2.453.406 3.328 1.219.875.813 1.312 1.875 1.312 3.188 0 1.5-.531 2.75-1.594 3.75-1.063 1-2.406 1.5-4.031 1.5zm2.016-4.922c.063-.25.094-.469.094-.656 0-.5-.172-.906-.516-1.219-.344-.313-.797-.469-1.359-.469-.688 0-1.297.234-1.828.703-.531.469-.891 1.078-1.078 1.828-.063.25-.094.469-.094.656 0 .5.172.891.516 1.172.344.281.797.422 1.359.422.688 0 1.297-.234 1.828-.703.531-.469.891-1.078 1.078-1.734z" fill="#0070E0"/>
                <path d="M50.266 17.154h-3.25L49.313 9.5c.094-.344.141-.625.141-.844 0-.375-.109-.656-.328-.844-.219-.188-.531-.281-.938-.281-.5 0-.969.141-1.406.422-.438.281-.797.656-1.078 1.125l-2.297 8.076h-3.25L43.407 5.5h2.969l-.313 1.219c.531-.469 1.109-.828 1.734-1.078.625-.25 1.281-.375 1.969-.375 1 0 1.781.281 2.344.844.563.563.844 1.328.844 2.297 0 .375-.078.844-.234 1.406l-2.454 7.341z" fill="#0070E0"/>
              </svg>
            </div>
            
            {/* Bitcoin */}
            <div className="flex items-center justify-center px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z" fill="#F7931A"/>
                <path d="M17.063 10.32c.24-1.603-.978-2.466-2.644-3.040l.54-2.168-1.318-.33-.526 2.11c-.347-.086-.702-.168-1.056-.248l.53-2.124-1.317-.33-.54 2.167c-.287-.065-.568-.13-.84-.198l.001-.006-1.816-.454-.35 1.407s.978.224.958.238c.534.133.63.487.614.767l-.615 2.469c.037.01.084.023.137.045l-.14-.035-.862 3.454c-.065.162-.23.405-.602.313.013.02-.959-.24-.959-.24l-.655 1.508 1.714.427c.319.08.631.163.94.242l-.546 2.19 1.316.329.54-2.17c.36.098.709.188 1.05.273l-.538 2.156 1.318.33.546-2.183c2.249.426 3.94.254 4.652-1.78.574-1.637-.029-2.58-1.21-3.196.86-.198 1.509-.764 1.681-1.934zm-3.008 4.217c-.408 1.636-3.164.752-4.058.53l.724-2.9c.894.223 3.76.665 3.334 2.37zm.408-4.24c-.372 1.49-2.665.733-3.41.547l.656-2.631c.745.186 3.142.533 2.754 2.083z" fill="#fff"/>
              </svg>
              <span className="ml-2 text-sm text-gray-300">Crypto</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
