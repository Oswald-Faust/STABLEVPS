"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

type PlanId = 'basic' | 'prime' | 'pro';
type BillingCycle = 'monthly' | 'yearly';
type Location = 'london' | 'amsterdam' | 'frankfurt' | 'newYork' | 'singapore' | 'tokyo';

const PLANS = {
  basic: { monthlyPrice: 29, yearlyPrice: 290, platforms: '1-3', cpu: '2 vCPU', ram: '4 GB', storage: '60 GB SSD' },
  prime: { monthlyPrice: 49, yearlyPrice: 490, platforms: '3-6', cpu: '4 vCPU', ram: '8 GB', storage: '120 GB SSD' },
  pro: { monthlyPrice: 89, yearlyPrice: 890, platforms: '6-10+', cpu: '6 vCPU', ram: '16 GB', storage: '200 GB NVMe' },
};

const LOCATIONS = [
  { id: 'london' as const, name: 'Londres', country: 'UK', flag: '🇬🇧', latency: '<1ms' },
  { id: 'amsterdam' as const, name: 'Amsterdam', country: 'Pays-Bas', flag: '🇳🇱', latency: '<2ms' },
  { id: 'frankfurt' as const, name: 'Francfort', country: 'Allemagne', flag: '🇩🇪', latency: '<2ms' },
  { id: 'newYork' as const, name: 'New York', country: 'USA', flag: '🇺🇸', latency: '<3ms' },
  { id: 'singapore' as const, name: 'Singapour', country: 'Singapour', flag: '🇸🇬', latency: '<5ms' },
  { id: 'tokyo' as const, name: 'Tokyo', country: 'Japon', flag: '🇯🇵', latency: '<5ms' },
];

export default function SignupPage() {
  const t = useTranslations('signup');
  const searchParams = useSearchParams();
  const canceled = searchParams.get('canceled');

  const [step, setStep] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('prime');
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const [selectedLocation, setSelectedLocation] = useState<Location>('london');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const getPrice = () => {
    const plan = PLANS[selectedPlan];
    return billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError(t('errors.passwordMismatch'));
      return;
    }

    if (formData.password.length < 8) {
      setError(t('errors.passwordTooShort'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          planId: selectedPlan,
          billingCycle,
          location: selectedLocation,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Redirect to Stripe Checkout
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-green-500/15 rounded-full filter blur-[150px]" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-green-600/10 rounded-full filter blur-[120px]" />

      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Link href="/" className="inline-flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-white">STABLE</span>
              <span className="text-2xl font-bold gradient-text">VPS</span>
            </div>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            {t('title')} <span className="gradient-text">{t('titleHighlight')}</span>
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">{t('subtitle')}</p>
        </div>

        {/* Canceled Alert */}
        {canceled && (
          <div className="max-w-2xl mx-auto mb-8 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-yellow-400">{t('paymentCanceled')}</span>
          </div>
        )}

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-12">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                step >= s ? 'bg-green-500 text-white' : 'bg-gray-800 text-gray-500'
              }`}>
                {step > s ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s}
              </div>
              <span className={`hidden sm:block text-sm font-medium ${step >= s ? 'text-white' : 'text-gray-500'}`}>
                {s === 1 ? t('steps.plan') : s === 2 ? t('steps.location') : t('steps.account')}
              </span>
              {s < 3 && <div className="w-12 h-0.5 bg-gray-800 ml-2" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Choose Plan */}
          {step === 1 && (
            <div className="space-y-8">
              {/* Billing Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>
                  {t('monthly')}
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="relative w-16 h-8 bg-gray-800 rounded-full transition-colors"
                >
                  <div className={`absolute top-1 w-6 h-6 bg-green-500 rounded-full transition-transform ${
                    billingCycle === 'yearly' ? 'translate-x-9' : 'translate-x-1'
                  }`} />
                </button>
                <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}>
                  {t('yearly')} <span className="ml-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">-17%</span>
                </span>
              </div>

              {/* Plan Cards */}
              <div className="grid md:grid-cols-3 gap-6">
                {(Object.keys(PLANS) as PlanId[]).map((planId) => {
                  const plan = PLANS[planId];
                  const isSelected = selectedPlan === planId;
                  const price = billingCycle === 'monthly' ? plan.monthlyPrice : Math.round(plan.yearlyPrice / 12);
                  
                  return (
                    <button
                      key={planId}
                      onClick={() => setSelectedPlan(planId)}
                      className={`glass-card p-6 rounded-2xl text-left transition-all ${
                        isSelected ? 'border-green-500 ring-2 ring-green-500/20' : 'hover:border-gray-600'
                      } ${planId === 'prime' ? 'md:scale-105' : ''}`}
                    >
                      {planId === 'prime' && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 rounded-full text-xs font-bold text-white">
                          {t('popular')}
                        </div>
                      )}
                      <h3 className="text-xl font-bold text-white mb-2 capitalize">{planId}</h3>
                      <div className="flex items-baseline gap-1 mb-4">
                        <span className="text-4xl font-extrabold gradient-text">{price}€</span>
                        <span className="text-gray-400">/mois</span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {plan.platforms} {t('platforms')}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {plan.cpu} • {plan.ram}
                        </div>
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {plan.storage}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-4 right-4">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary px-12 py-4"
                >
                  {t('continue')}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Location */}
          {step === 2 && (
            <div className="space-y-8">
              <p className="text-center text-gray-400 mb-8">{t('locationHint')}</p>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {LOCATIONS.map((loc) => {
                  const isSelected = selectedLocation === loc.id;
                  return (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc.id)}
                      className={`glass-card p-5 rounded-xl flex items-center gap-4 transition-all ${
                        isSelected ? 'border-green-500 ring-2 ring-green-500/20' : 'hover:border-gray-600'
                      }`}
                    >
                      <span className="text-3xl">{loc.flag}</span>
                      <div className="flex-1 text-left">
                        <p className="font-semibold text-white">{loc.name}</p>
                        <p className="text-sm text-gray-400">{loc.country}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-400">{loc.latency}</p>
                        <p className="text-xs text-gray-500">{t('latency')}</p>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center gap-4">
                <button onClick={() => setStep(1)} className="btn-secondary px-8 py-4">
                  {t('back')}
                </button>
                <button onClick={() => setStep(3)} className="btn-primary px-12 py-4">
                  {t('continue')}
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Account Creation */}
          {step === 3 && (
            <div className="max-w-md mx-auto">
              <div className="glass-card rounded-3xl p-8">
                {/* Order Summary */}
                <div className="p-4 bg-gray-900/50 rounded-xl mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">{t('plan')}</span>
                    <span className="text-white font-semibold capitalize">{selectedPlan}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">{t('locationLabel')}</span>
                    <span className="text-white">{LOCATIONS.find(l => l.id === selectedLocation)?.name}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">{t('billing')}</span>
                    <span className="text-white">{billingCycle === 'monthly' ? t('monthly') : t('yearly')}</span>
                  </div>
                  <div className="border-t border-gray-700 my-3" />
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">{t('total')}</span>
                    <span className="text-2xl font-bold gradient-text">{getPrice()}€</span>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl mb-6 flex items-center gap-3">
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-400 text-sm">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('firstName')}</label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">{t('lastName')}</label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('email')}</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('emailPlaceholder')}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('password')}</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 pr-11 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                        </svg>
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t('passwordHint')}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">{t('confirmPassword')}</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
                      required
                    />
                  </div>

                  <div className="flex items-start gap-2 text-sm text-gray-400">
                    <input type="checkbox" required className="mt-1" />
                    <span>
                      {t('termsAgree')}{' '}
                      <Link href="/terms" className="text-green-400 hover:underline">{t('terms')}</Link>
                      {' '}{t('and')}{' '}
                      <Link href="/privacy" className="text-green-400 hover:underline">{t('privacy')}</Link>
                    </span>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setStep(2)} className="btn-secondary flex-1 py-4 justify-center">
                      {t('back')}
                    </button>
                    <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-4 justify-center disabled:opacity-50">
                      {isLoading ? (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <>
                          {t('payNow')} {getPrice()}€
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <p className="text-center text-gray-400 mt-6 text-sm">
                  {t('alreadyHaveAccount')}{' '}
                  <Link href="/login" className="text-green-400 hover:text-green-300 font-medium">
                    {t('signIn')}
                  </Link>
                </p>
              </div>

              {/* Security Badge */}
              <div className="flex items-center justify-center gap-4 mt-6 text-gray-500 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {t('securePayment')}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  {t('moneyBackGuarantee')}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
