"use client";

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  totalEarnings: number;
  pendingReferrals: number;
}

interface Referee {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
}

interface ReferralRecord {
  id: string;
  referee: Referee;
  status: 'pending' | 'completed' | 'expired';
  commissionAmount: number;
  orderAmount: number;
  paidAt?: string;
  createdAt: string;
}

interface ReferralData {
  referralCode: string;
  referralLink: string;
  stats: ReferralStats;
  referrals: ReferralRecord[];
  discountRate: number;
  commissionRate: number;
}

export default function AffiliationPage() {
  const t = useTranslations('affiliation');
  const [data, setData] = useState<ReferralData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const response = await fetch('/api/referrals');
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load referral data');
      }

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <span className="text-3xl">🎁</span>
          {t('title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{t('subtitle')}</p>
      </div>

      {/* How it works */}
      <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('howItWorks')}
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-lg font-bold text-green-600 dark:text-green-500">1</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('step1Title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('step1Desc')}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-lg font-bold text-green-600 dark:text-green-500">2</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('step2Title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('step2Desc')}</p>
          </div>
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <div className="w-10 h-10 bg-green-500/10 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-3">
              <span className="text-lg font-bold text-green-600 dark:text-green-500">3</span>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{t('step3Title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('step3Desc')}</p>
          </div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('yourReferralLink')}</h2>
        
        <div className="space-y-4">
          {/* Referral Code */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('yourCode')}</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-lg text-green-600 dark:text-green-400 font-bold">
                {data?.referralCode}
              </div>
              <button
                onClick={() => copyToClipboard(data?.referralCode || '')}
                className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title={t('copy')}
              >
                {copied ? (
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Full Link */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">{t('fullLink')}</label>
            <div className="flex items-center gap-3">
              <div className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-600 dark:text-gray-300 truncate font-mono">
                {data?.referralLink}
              </div>
              <button
                onClick={() => copyToClipboard(data?.referralLink || '')}
                className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors shadow-sm"
              >
                {copied ? t('copied') : t('copy')}
              </button>
            </div>
          </div>
        </div>

        {/* Benefits reminder */}
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-green-700 dark:text-green-400 font-medium">{t('benefitsTitle')}</p>
              <ul className="text-sm text-green-600/80 dark:text-green-400/80 mt-1 space-y-1">
                <li>• {t('benefitReferee', { discount: data?.discountRate || 10 })}</li>
                <li>• {t('benefitReferrer', { commission: data?.commissionRate || 10 })}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalReferrals')}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data?.stats.totalReferrals || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 dark:bg-green-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600 dark:text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('successfulReferrals')}</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{data?.stats.successfulReferrals || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-yellow-50 dark:bg-yellow-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('pendingReferrals')}</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{data?.stats.pendingReferrals || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-5 rounded-xl shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-50 dark:bg-purple-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('totalEarnings')}</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{(data?.stats.totalEarnings || 0).toFixed(2)}€</p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral History */}
      <div className="bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('referralHistory')}</h2>
        
        {data?.referrals && data.referrals.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('referee')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('status')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('orderAmount')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('commission')}</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">{t('date')}</th>
                </tr>
              </thead>
              <tbody>
                {data.referrals.map((referral) => (
                  <tr key={referral.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {referral.referee?.firstName} {referral.referee?.lastName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">{referral.referee?.email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        referral.status === 'completed' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' 
                          : referral.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                          : 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400'
                      }`}>
                        {referral.status === 'completed' ? t('statusCompleted') : 
                         referral.status === 'pending' ? t('statusPending') : t('statusExpired')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-900 dark:text-white">
                      {referral.orderAmount > 0 ? `${referral.orderAmount.toFixed(2)}€` : '-'}
                    </td>
                    <td className="py-4 px-4 text-green-600 dark:text-green-400 font-medium">
                      {referral.commissionAmount > 0 ? `+${referral.commissionAmount.toFixed(2)}€` : '-'}
                    </td>
                    <td className="py-4 px-4 text-gray-500 dark:text-gray-400 text-sm">
                      {new Date(referral.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">{t('noReferralsYet')}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t('shareYourLink')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
