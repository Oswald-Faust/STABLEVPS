"use client";

import { useTranslations } from 'next-intl';

export default function Locations() {
  const t = useTranslations('locations');

  const locations = [
    { cityKey: 'london', countryKey: 'uk', flag: '🇬🇧', latency: '<1ms', featured: true },
    { cityKey: 'amsterdam', countryKey: 'netherlands', flag: '🇳🇱', latency: '<2ms', featured: false },
    { cityKey: 'frankfurt', countryKey: 'germany', flag: '🇩🇪', latency: '<2ms', featured: false },
    { cityKey: 'newYork', countryKey: 'usa', flag: '🇺🇸', latency: '<3ms', featured: true },
    { cityKey: 'singapore', countryKey: 'sg', flag: '🇸🇬', latency: '<5ms', featured: false },
    { cityKey: 'tokyo', countryKey: 'japan', flag: '🇯🇵', latency: '<5ms', featured: false },
  ];

  return (
    <section id="locations" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-black" />
      
      {/* World Map Background (stylized) */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="mapGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          {/* Simplified world continents as dots/circles */}
          {/* Europe */}
          <circle cx="480" cy="180" r="3" fill="#22c55e" className="animate-pulse" />
          <circle cx="500" cy="170" r="2" fill="#22c55e" />
          <circle cx="520" cy="185" r="2" fill="#22c55e" />
          <circle cx="470" cy="200" r="2" fill="#22c55e" />
          {/* North America */}
          <circle cx="200" cy="200" r="3" fill="#22c55e" className="animate-pulse" />
          <circle cx="180" cy="220" r="2" fill="#22c55e" />
          <circle cx="220" cy="180" r="2" fill="#22c55e" />
          {/* Asia */}
          <circle cx="750" cy="200" r="3" fill="#22c55e" className="animate-pulse" />
          <circle cx="800" cy="220" r="2" fill="#22c55e" />
          <circle cx="700" cy="250" r="2" fill="#22c55e" />
          {/* Connection lines */}
          <line x1="200" y1="200" x2="480" y2="180" stroke="#22c55e" strokeWidth="0.5" opacity="0.3" />
          <line x1="480" y1="180" x2="750" y2="200" stroke="#22c55e" strokeWidth="0.5" opacity="0.3" />
          <line x1="200" y1="200" x2="750" y2="200" stroke="#22c55e" strokeWidth="0.3" opacity="0.2" strokeDasharray="5,5" />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
            <span className="text-green-400 text-sm font-medium">{t('badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            {t('title')} <span className="gradient-text">{t('titleHighlight')}</span>
          </h2>
          <p className="text-gray-400 text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* Locations Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {locations.map((location, index) => (
            <div
              key={index}
              className={`glass-card p-6 rounded-2xl flex items-center gap-4 ${
                location.featured ? 'border-green-500/40' : ''
              }`}
            >
              {/* Flag */}
              <div className="text-4xl">{location.flag}</div>
              
              {/* Info */}
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">{t(`cities.${location.cityKey}`)}</h3>
                <p className="text-gray-400 text-sm">{t(`countries.${location.countryKey}`)}</p>
              </div>
              
              {/* Latency */}
              <div className="text-right">
                <p className="text-xl font-bold gradient-text">{location.latency}</p>
                <p className="text-gray-500 text-xs">{t('latency')}</p>
              </div>

              {/* Featured Badge */}
              {location.featured && (
                <div className="absolute -top-2 -right-2">
                  <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Info Box */}
        <div className="mt-16 max-w-3xl mx-auto">
          <div className="glass-card rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-white">{t('infoTitle')}</h3>
            </div>
            <p className="text-gray-400">
              {t('infoTitle')} Choisissez le datacenter le plus proche de votre <span className="text-green-400 font-medium">{t('broker')}</span>, pas de vous. Pour les brokers Forex européens, nous recommandons <span className="text-green-400 font-medium">{t('cities.london')}</span> ou <span className="text-green-400 font-medium">{t('cities.amsterdam')}</span>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
