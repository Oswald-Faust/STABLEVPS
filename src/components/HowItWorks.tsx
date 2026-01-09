"use client";

import { useTranslations } from 'next-intl';

export default function HowItWorks() {
  const t = useTranslations('howItWorks');

  const steps = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      titleKey: 'steps.step1.title',
      descKey: 'steps.step1.description'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      titleKey: 'steps.step2.title',
      descKey: 'steps.step2.description'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      titleKey: 'steps.step3.title',
      descKey: 'steps.step3.description'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      titleKey: 'steps.step4.title',
      descKey: 'steps.step4.description'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-950 to-black" />
      
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

        {/* Visual Diagram */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mb-20">
          {/* Your PC */}
          <div className="glass-card p-6 rounded-2xl text-center w-full max-w-xs">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">{t('diagram.yourPc')}</h3>
            <p className="text-sm text-gray-400">{t('diagram.yourPcDesc')}</p>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex items-center">
            <div className="w-16 h-0.5 bg-gradient-to-r from-gray-700 to-green-500" />
            <svg className="w-6 h-6 text-green-500 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="lg:hidden">
            <svg className="w-6 h-6 text-green-500 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* StableVPS Cloud */}
          <div className="glass-card p-8 rounded-2xl text-center w-full max-w-sm border-green-500/30 relative animate-pulse-glow">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-green-500 rounded-full text-xs font-bold text-white">
              {t('diagram.cloud')}
            </div>
            <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border border-green-500/30">
              <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-bold gradient-text mb-2">STABLEVPS</h3>
            <p className="text-sm text-gray-400">{t('diagram.cloudDesc')}</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-green-400 text-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              {t('diagram.alwaysActive')}
            </div>
          </div>

          {/* Arrow */}
          <div className="hidden lg:flex items-center">
            <div className="w-16 h-0.5 bg-gradient-to-r from-green-500 to-gray-700" />
            <svg className="w-6 h-6 text-gray-400 -ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="lg:hidden">
            <svg className="w-6 h-6 text-green-500 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>

          {/* Broker */}
          <div className="glass-card p-6 rounded-2xl text-center w-full max-w-xs">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gray-800 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h3 className="font-semibold text-white mb-2">{t('diagram.broker')}</h3>
            <p className="text-sm text-gray-400">{t('diagram.brokerDesc')}</p>
          </div>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-green-500/50 to-transparent" />
              )}
              
              <div className="glass-card p-8 rounded-2xl text-center relative hover:border-green-500/40 transition-all">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-sm font-bold text-white">
                  {index + 1}
                </div>
                
                {/* Icon */}
                <div className="feature-icon mx-auto mb-6 mt-4">
                  {step.icon}
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3">{t(step.titleKey)}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{t(step.descKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
