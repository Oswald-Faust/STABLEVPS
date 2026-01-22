"use client";

import { useState } from 'react';
import { useTranslations } from 'next-intl';

export default function FAQ() {
  const t = useTranslations('faq');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8'];

  return (
    <section id="faq" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-black" />
      <div className="absolute inset-0 grid-pattern opacity-20" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-6">
            <span className="text-green-600 dark:text-green-400 text-sm font-medium">{t('badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('title')} <span className="gradient-text">{t('titleHighlight')}</span>
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            {t('subtitle')}
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqKeys.map((key, index) => (
            <div
              key={index}
              className="glass-card rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full p-6 text-left flex items-center justify-between gap-4"
              >
                <span className="text-lg font-medium text-gray-900 dark:text-white">{t(`items.${key}.question`)}</span>
                <svg
                  className={`w-5 h-5 text-green-500 flex-shrink-0 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div className={`overflow-hidden transition-all duration-300 ${
                openIndex === index ? 'max-h-96 pb-6' : 'max-h-0'
              }`}>
                <div className="px-6">
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{t(`items.${key}.answer`)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">{t('contact')}</p>
          <a
            href="mailto:support@stablevps.com"
            className="inline-flex items-center gap-2 text-green-600 dark:text-green-400 font-medium hover:text-green-500 dark:hover:text-green-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            {t('contactLink')}
          </a>
        </div>
      </div>
    </section>
  );
}
