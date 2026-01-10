"use client";

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';

export default function SignupSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>}>
      <SignupSuccessContent />
    </Suspense>
  );
}

function SignupSuccessContent() {
  const t = useTranslations('signupSuccess');
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = '/dashboard';
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black" />
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-green-500/20 rounded-full filter blur-[150px] animate-pulse" />

      <div className="relative z-10 text-center px-4 max-w-lg">
        {/* Success Animation */}
        <div className="w-24 h-24 mx-auto mb-8 relative">
          <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
          <div className="relative w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          {t('title')} 🎉
        </h1>
        <p className="text-gray-400 text-lg mb-8">
          {t('subtitle')}
        </p>

        {/* Next Steps */}
        <div className="glass-card rounded-2xl p-6 mb-8 text-left">
          <h3 className="text-white font-semibold mb-4">{t('nextSteps')}</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold text-sm">1</span>
              </div>
              <div>
                <p className="text-white font-medium">{t('step1Title')}</p>
                <p className="text-gray-400 text-sm">{t('step1Desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold text-sm">2</span>
              </div>
              <div>
                <p className="text-white font-medium">{t('step2Title')}</p>
                <p className="text-gray-400 text-sm">{t('step2Desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                <span className="text-green-400 font-bold text-sm">3</span>
              </div>
              <div>
                <p className="text-white font-medium">{t('step3Title')}</p>
                <p className="text-gray-400 text-sm">{t('step3Desc')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Link href="/dashboard" className="btn-primary px-8 py-4 inline-flex">
          {t('goToDashboard')}
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>

        <p className="text-gray-500 text-sm mt-6">
          {t('redirecting', { seconds: countdown })}
        </p>

        {sessionId && (
          <p className="text-gray-600 text-xs mt-4">
            Session ID: {sessionId.slice(0, 20)}...
          </p>
        )}
      </div>
    </div>
  );
}
