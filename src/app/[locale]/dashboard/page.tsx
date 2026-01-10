"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  subscription?: {
    planId: 'basic' | 'prime' | 'pro';
    billingCycle: 'monthly' | 'yearly';
    status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'pending';
    currentPeriodEnd?: string;
  };
  vps?: {
    serverId?: string;
    ipAddress?: string;
    location: string;
    status: 'provisioning' | 'active' | 'suspended' | 'terminated';
    rdpUsername?: string;
    rdpPassword?: string;
    createdAt?: string;
  };
  createdAt: string;
}

const PLAN_SPECS = {
  basic: { name: 'Basique', cpu: '2 vCPU', ram: '4 GB', storage: '60 GB SSD', platforms: '1-3' },
  prime: { name: 'Prime', cpu: '4 vCPU', ram: '8 GB', storage: '120 GB SSD', platforms: '3-6' },
  pro: { name: 'Pro', cpu: '6 vCPU', ram: '16 GB', storage: '200 GB NVMe', platforms: '6-10+' },
};

const LOCATIONS = {
  london: { name: 'Londres', flag: '🇬🇧' },
  amsterdam: { name: 'Amsterdam', flag: '🇳🇱' },
  frankfurt: { name: 'Francfort', flag: '🇩🇪' },
  newYork: { name: 'New York', flag: '🇺🇸' },
  singapore: { name: 'Singapour', flag: '🇸🇬' },
  tokyo: { name: 'Tokyo', flag: '🇯🇵' },
};

export default function DashboardPage() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRdpPassword, setShowRdpPassword] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'vps' | 'billing'>('overview');

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/user');
      const data = await response.json();

      if (!response.ok) {
        router.push('/login');
        return;
      }

      setUser(data.user);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const planSpec = user.subscription?.planId ? PLAN_SPECS[user.subscription.planId] : null;
  const location = user.vps?.location ? LOCATIONS[user.vps.location as keyof typeof LOCATIONS] : null;

  return (
    <div className="min-h-screen bg-black">
      {/* Background */}
      <div className="fixed inset-0 grid-pattern opacity-20 pointer-events-none" />
      <div className="fixed top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full filter blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-white">STABLE</span>
                <span className="text-xl font-bold gradient-text">VPS</span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-white font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title={t('logout')}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {t('welcome')}, {user.firstName}! 👋
          </h1>
          <p className="text-gray-400">{t('welcomeSubtitle')}</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {(['overview', 'vps', 'billing'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {t(`tabs.${tab}`)}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* VPS Status */}
              <div className="glass-card rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400 text-sm">{t('stats.vpsStatus')}</span>
                  <div className={`w-3 h-3 rounded-full ${
                    user.vps?.status === 'active' ? 'bg-green-500 animate-pulse' :
                    user.vps?.status === 'provisioning' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                </div>
                <p className="text-2xl font-bold text-white capitalize">
                  {user.vps?.status === 'active' ? t('status.online') :
                   user.vps?.status === 'provisioning' ? t('status.provisioning') :
                   t('status.offline')}
                </p>
              </div>

              {/* Plan */}
              <div className="glass-card rounded-2xl p-6">
                <p className="text-gray-400 text-sm mb-4">{t('stats.currentPlan')}</p>
                <p className="text-2xl font-bold gradient-text">{planSpec?.name || '-'}</p>
              </div>

              {/* Location */}
              <div className="glass-card rounded-2xl p-6">
                <p className="text-gray-400 text-sm mb-4">{t('stats.location')}</p>
                <p className="text-2xl font-bold text-white">
                  {location?.flag} {location?.name || '-'}
                </p>
              </div>

              {/* Uptime */}
              <div className="glass-card rounded-2xl p-6">
                <p className="text-gray-400 text-sm mb-4">{t('stats.uptime')}</p>
                <p className="text-2xl font-bold text-green-400">99.9%</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t('quickActions.title')}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">{t('quickActions.rdp')}</span>
                </button>

                <button className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">{t('quickActions.restart')}</span>
                </button>

                <button className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">{t('quickActions.backup')}</span>
                </button>

                <Link href="/support" className="flex items-center gap-3 p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium">{t('quickActions.support')}</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* VPS Tab */}
        {activeTab === 'vps' && (
          <div className="space-y-6">
            {/* VPS Status Card */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">{t('vps.title')}</h3>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                  user.vps?.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  user.vps?.status === 'provisioning' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    user.vps?.status === 'active' ? 'bg-green-500 animate-pulse' :
                    user.vps?.status === 'provisioning' ? 'bg-yellow-500 animate-pulse' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm font-medium capitalize">
                    {user.vps?.status === 'active' ? t('status.online') :
                     user.vps?.status === 'provisioning' ? t('status.provisioning') :
                     t('status.offline')}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* VPS Info */}
                <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-gray-900/50 rounded-xl">
                    <span className="text-gray-400">{t('vps.ip')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono">{user.vps?.ipAddress || '192.168.1.XXX'}</span>
                      <button
                        onClick={() => copyToClipboard(user.vps?.ipAddress || '', 'ip')}
                        className="text-gray-400 hover:text-white"
                      >
                        {copied === 'ip' ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between p-3 bg-gray-900/50 rounded-xl">
                    <span className="text-gray-400">{t('vps.username')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono">{user.vps?.rdpUsername || 'Administrator'}</span>
                      <button
                        onClick={() => copyToClipboard(user.vps?.rdpUsername || 'Administrator', 'username')}
                        className="text-gray-400 hover:text-white"
                      >
                        {copied === 'username' ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between p-3 bg-gray-900/50 rounded-xl">
                    <span className="text-gray-400">{t('vps.password')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-mono">
                        {showRdpPassword ? (user.vps?.rdpPassword || 'P@ssw0rd123!') : '••••••••'}
                      </span>
                      <button
                        onClick={() => setShowRdpPassword(!showRdpPassword)}
                        className="text-gray-400 hover:text-white"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showRdpPassword ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                        </svg>
                      </button>
                      <button
                        onClick={() => copyToClipboard(user.vps?.rdpPassword || 'P@ssw0rd123!', 'password')}
                        className="text-gray-400 hover:text-white"
                      >
                        {copied === 'password' ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between p-3 bg-gray-900/50 rounded-xl">
                    <span className="text-gray-400">{t('vps.location')}</span>
                    <span className="text-white">{location?.flag} {location?.name}</span>
                  </div>
                </div>

                {/* Specs */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-400">{t('vps.specs')}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-gray-900/50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-white">{planSpec?.cpu}</p>
                      <p className="text-xs text-gray-500">CPU</p>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-white">{planSpec?.ram}</p>
                      <p className="text-xs text-gray-500">RAM</p>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-white">{planSpec?.storage}</p>
                      <p className="text-xs text-gray-500">{t('vps.storage')}</p>
                    </div>
                    <div className="p-4 bg-gray-900/50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-white">{planSpec?.platforms}</p>
                      <p className="text-xs text-gray-500">{t('vps.platforms')}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Guide */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t('vps.howToConnect')}</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-900/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">{t('vps.step1Title')}</h4>
                  <p className="text-gray-400 text-sm">{t('vps.step1Desc')}</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                    <span className="text-blue-400 font-bold">2</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">{t('vps.step2Title')}</h4>
                  <p className="text-gray-400 text-sm">{t('vps.step2Desc')}</p>
                </div>
                <div className="p-4 bg-gray-900/50 rounded-xl">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3">
                    <span className="text-blue-400 font-bold">3</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">{t('vps.step3Title')}</h4>
                  <p className="text-gray-400 text-sm">{t('vps.step3Desc')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            {/* Current Plan */}
            <div className="glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">{t('billing.currentPlan')}</h3>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user.subscription?.status === 'active' ? 'bg-green-500/20 text-green-400' :
                  'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {user.subscription?.status === 'active' ? t('billing.active') : t('billing.pending')}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-2xl">
                    <p className="text-green-400 font-medium mb-2">{planSpec?.name || 'Plan'}</p>
                    <p className="text-4xl font-bold text-white mb-4">
                      {user.subscription?.billingCycle === 'monthly' ? '49€' : '490€'}
                      <span className="text-lg text-gray-400 font-normal">
                        /{user.subscription?.billingCycle === 'monthly' ? t('billing.month') : t('billing.year')}
                      </span>
                    </p>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {planSpec?.cpu} • {planSpec?.ram}
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {planSpec?.storage}
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {planSpec?.platforms} {t('billing.platforms')}
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between p-3 bg-gray-900/50 rounded-xl">
                    <span className="text-gray-400">{t('billing.nextPayment')}</span>
                    <span className="text-white">
                      {user.subscription?.currentPeriodEnd 
                        ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString()
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-gray-900/50 rounded-xl">
                    <span className="text-gray-400">{t('billing.paymentMethod')}</span>
                    <span className="text-white">•••• 4242</span>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors">
                      {t('billing.upgrade')}
                    </button>
                    <button className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl text-white font-medium transition-colors">
                      {t('billing.manageBilling')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment History */}
            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">{t('billing.history')}</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-400 text-sm">
                      <th className="pb-3">{t('billing.date')}</th>
                      <th className="pb-3">{t('billing.description')}</th>
                      <th className="pb-3">{t('billing.amount')}</th>
                      <th className="pb-3">{t('billing.status')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    <tr className="border-t border-gray-800">
                      <td className="py-3">{new Date().toLocaleDateString()}</td>
                      <td className="py-3">{planSpec?.name} VPS - {user.subscription?.billingCycle}</td>
                      <td className="py-3">{user.subscription?.billingCycle === 'monthly' ? '49€' : '490€'}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">
                          {t('billing.paid')}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
