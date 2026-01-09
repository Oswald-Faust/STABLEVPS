"use client";

import { useTranslations } from 'next-intl';

export default function Features() {
  const t = useTranslations('features');

  const featureKeys = ['latency', 'uptime', 'ddos', 'storage', 'rdp', 'support'];

  const icons: Record<string, React.ReactNode> = {
    latency: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    uptime: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    ddos: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    storage: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    rdp: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    support: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    )
  };

  const platforms = ['MetaTrader 4', 'MetaTrader 5', 'cTrader', 'NinjaTrader', 'TradingView'];

  return (
    <section id="features" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-black to-gray-950" />
      
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

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featureKeys.map((key, index) => (
            <div
              key={index}
              className="glass-card p-8 rounded-2xl group"
            >
              {/* Icon */}
              <div className="feature-icon mb-6 group-hover:scale-110 transition-transform">
                {icons[key]}
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-3">{t(`items.${key}.title`)}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">{t(`items.${key}.description`)}</p>
              
              {/* Stat */}
              <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                <span className="text-2xl font-bold gradient-text">{t(`items.${key}.stat`)}</span>
                <span className="text-gray-500 text-sm">{t(`items.${key}.statLabel`)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Compatibility Section */}
        <div className="mt-20 glass-card rounded-3xl p-8 lg:p-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                {t('compatibility.title')} <span className="gradient-text">{t('compatibility.titleHighlight')}</span>
              </h3>
              <p className="text-gray-400 mb-6">
                {t('compatibility.description')}
              </p>
              <div className="flex flex-wrap gap-3">
                {platforms.map((platform, i) => (
                  <span key={i} className="px-4 py-2 bg-gray-800 rounded-lg text-sm text-gray-300 border border-gray-700">
                    {platform}
                  </span>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="stat-glow p-6 bg-gray-900/50 rounded-2xl text-center">
                <p className="text-4xl font-bold gradient-text mb-2">500+</p>
                <p className="text-gray-400 text-sm">{t('compatibility.stats.traders')}</p>
              </div>
              <div className="stat-glow p-6 bg-gray-900/50 rounded-2xl text-center">
                <p className="text-4xl font-bold gradient-text mb-2">10M+</p>
                <p className="text-gray-400 text-sm">{t('compatibility.stats.trades')}</p>
              </div>
              <div className="stat-glow p-6 bg-gray-900/50 rounded-2xl text-center">
                <p className="text-4xl font-bold gradient-text mb-2">99.9%</p>
                <p className="text-gray-400 text-sm">{t('compatibility.stats.uptime')}</p>
              </div>
              <div className="stat-glow p-6 bg-gray-900/50 rounded-2xl text-center">
                <p className="text-4xl font-bold gradient-text mb-2">1ms</p>
                <p className="text-gray-400 text-sm">{t('compatibility.stats.latency')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
