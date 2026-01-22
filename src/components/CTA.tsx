"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function CTA() {
  const t = useTranslations('cta');

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-100 via-green-50/20 to-white dark:from-gray-950 dark:via-green-950/20 dark:to-black" />
      
      {/* Animated Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-500/20 rounded-full filter blur-[150px] animate-pulse" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('title')} <span className="gradient-text">{t('titleHighlight')}</span> ?
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            {t('subtitle')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link href="#pricing" className="btn-primary text-lg px-10 py-5 animate-pulse-glow">
              {t('primary')}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="#faq" className="btn-secondary text-lg px-10 py-5">
              {t('secondary')}
            </Link>
          </div>

          {/* Trust Elements */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">{t('trust.refund')}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">{t('trust.noCommitment')}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm">{t('trust.setup')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
