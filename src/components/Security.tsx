"use client";

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import connectionImg from '@/assets/connection.jpeg';

export default function Security() {
  const t = useTranslations('security');



  return (
    <section id="security" className="py-24 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-100 via-white to-gray-100 dark:from-gray-950 dark:via-black dark:to-gray-950" />
      
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
              <span className="text-green-600 dark:text-green-400 text-sm font-medium">{t('badge')}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
              <span className="gradient-text">{t('titleHighlight')}</span>
            </h2>

            {/* Security Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-3xl font-bold gradient-text mb-1">0</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('stats.incidents')}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-3xl font-bold gradient-text mb-1">L4</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('stats.protection')}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-3xl font-bold gradient-text mb-1">256-bit</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('stats.encryption')}</p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-800">
                <p className="text-3xl font-bold gradient-text mb-1">24/7</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{t('stats.monitoring')}</p>
              </div>
            </div>
          </div>

          {/* Features Side */}
          {/* Image Side */}
          <div className="relative h-[600px] w-full rounded-2xl overflow-hidden group">
            <Image
              src={connectionImg}
              alt="Secure Data Center London"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />


          </div>
        </div>
      </div>
    </section>
  );
}
