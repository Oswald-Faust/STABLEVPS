"use client";

import { useTranslations } from 'next-intl';

export default function Security() {
  const t = useTranslations('security');

  const featureKeys = ['ddos', 'encryption', 'backups', 'monitoring'];

  const icons: Record<string, React.ReactNode> = {
    ddos: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    encryption: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    backups: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
      </svg>
    ),
    monitoring: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    )
  };

  return (
    <section id="security" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-black to-gray-950" />
      
      {/* Animated Shield Background */}
      <div className="absolute inset-0 flex items-center justify-center opacity-5">
        <svg className="w-[800px] h-[800px] animate-pulse" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="0.5">
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content Side */}
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
              <span className="text-green-400 text-sm font-medium">{t('badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              {t('title')}<br />
              <span className="gradient-text">{t('titleHighlight')}</span>
            </h2>
            <p className="text-gray-400 text-lg mb-8">
              {t('subtitle')}
            </p>

            {/* Security Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <p className="text-3xl font-bold gradient-text mb-1">0</p>
                <p className="text-gray-400 text-sm">{t('stats.incidents')}</p>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <p className="text-3xl font-bold gradient-text mb-1">L4</p>
                <p className="text-gray-400 text-sm">{t('stats.protection')}</p>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <p className="text-3xl font-bold gradient-text mb-1">256-bit</p>
                <p className="text-gray-400 text-sm">{t('stats.encryption')}</p>
              </div>
              <div className="p-4 bg-gray-900/50 rounded-xl border border-gray-800">
                <p className="text-3xl font-bold gradient-text mb-1">24/7</p>
                <p className="text-gray-400 text-sm">{t('stats.monitoring')}</p>
              </div>
            </div>
          </div>

          {/* Features Side */}
          <div className="space-y-6">
            {featureKeys.map((key, index) => (
              <div
                key={index}
                className="glass-card p-6 rounded-2xl flex gap-6 group"
              >
                <div className="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                  {icons[key]}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">{t(`features.${key}.title`)}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{t(`features.${key}.description`)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
