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
  basic: { name: 'Basique', cpu: '2 vCPU', ram: '4 GB', storage: '60 GB SSD', platforms: '1-3', price: { monthly: 29, yearly: 290 } },
  prime: { name: 'Prime', cpu: '4 vCPU', ram: '8 GB', storage: '120 GB SSD', platforms: '3-6', price: { monthly: 49, yearly: 490 } },
  pro: { name: 'Pro', cpu: '6 vCPU', ram: '16 GB', storage: '200 GB NVMe', platforms: '6-10+', price: { monthly: 89, yearly: 890 } },
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
  const [activeTab, setActiveTab] = useState<'overview' | 'vps' | 'billing' | 'support'>('overview');
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

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

  const handleManageBilling = async () => {
    try {
      setIsLoadingPortal(true);
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Failed to create portal session');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoadingPortal(false);
    }
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

  const SidebarItem = ({ id, label, icon }: { id: typeof activeTab, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        activeTab === id
          ? 'bg-green-600 text-white shadow-lg shadow-green-900/20'
          : 'text-gray-400 hover:bg-gray-800 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-black flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex-shrink-0 hidden lg:flex flex-col">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">STABLEVPS</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          <SidebarItem 
            id="overview" 
            label={t('tabs.overview')} 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>} 
          />
          <SidebarItem 
            id="vps" 
            label="Mon VPS" 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" /></svg>} 
          />
          <SidebarItem 
            id="billing" 
            label={t('tabs.billing')} 
            icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>} 
          />
        </nav>

        <div className="p-4 border-t border-gray-800">
           <Link href="/support" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all">
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
             </svg>
             <span className="font-medium">{t('quickActions.support')}</span>
           </Link>
           <button 
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
           >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
             </svg>
             <span className="font-medium">{t('logout')}</span>
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-gray-900/50 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
           <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              <h1 className="text-xl font-semibold text-white">
                {activeTab === 'overview' && t('tabs.overview')}
                {activeTab === 'vps' && 'Mon VPS'}
                {activeTab === 'billing' && t('tabs.billing')}
              </h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-gray-800 py-1.5 px-3 rounded-full border border-gray-700">
                  <div className={`w-2 h-2 rounded-full ${user.vps?.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm text-gray-300">
                     {user.firstName} {user.lastName}
                  </span>
                </div>
              </div>
           </div>
        </header>

        <div className="container mx-auto px-6 py-8">
          {/* Content Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
               {/* Welcome Banner */}
               <div className="bg-gradient-to-r from-green-900/40 to-gray-900 border border-green-500/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                 <div>
                   <h2 className="text-2xl font-bold text-white mb-2">{t('welcome')}, {user.firstName}! 👋</h2>
                   <p className="text-gray-400">{t('welcomeSubtitle')}</p>
                 </div>
                 {user.vps?.status !== 'active' && user.vps?.status !== 'provisioning' && (
                    <button onClick={handleManageBilling} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors">
                      Activer mon VPS
                    </button>
                 )}
               </div>

               <h3 className="text-lg font-semibold text-white">Vos services</h3>
               
               {/* VPS Card (Hostinger Style) */}
               <div className="glass-card bg-gray-900 border border-gray-800 rounded-xl p-0 overflow-hidden hover:border-gray-700 transition-colors">
                  <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                           <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                           </svg>
                        </div>
                        <div>
                           <div className="flex items-center gap-3">
                              <h4 className="font-bold text-white text-lg">{planSpec?.name} VPS</h4>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                 user.vps?.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                                 'bg-yellow-500/20 text-yellow-400'
                              }`}>
                                {user.vps?.status || 'Pending'}
                              </span>
                           </div>
                           <p className="text-gray-400 text-sm mt-1">{location?.name} • {user.vps?.ipAddress || 'Waiting for IP...'}</p>
                        </div>
                     </div>
                     
                     <div className="flex gap-4 w-full md:w-auto">
                        <button 
                           onClick={() => setActiveTab('vps')} 
                           className="flex-1 md:flex-none px-6 py-2.5 border border-gray-600 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                        >
                           Gérer
                        </button>
                     </div>
                  </div>
                  <div className="bg-gray-950/50 px-6 py-3 border-t border-gray-800 flex justify-between items-center text-sm text-gray-500">
                     <span>Renouvellement: {user.subscription?.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}</span>
                     <span>{user.subscription?.billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}</span>
                  </div>
               </div>
            </div>
          )}

          {/* VPS Management */}
          {activeTab === 'vps' && (
             <div className="space-y-6">
                <div className="glass-card bg-gray-900 border border-gray-800 rounded-2xl p-6">
                   <h3 className="text-xl font-bold text-white mb-6">Informations de connexion</h3>
                   
                   <div className="grid md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                         <div className="p-4 bg-black/30 rounded-xl border border-gray-800">
                            <span className="text-gray-500 text-sm block mb-1">Adresse IP</span>
                            <div className="flex justify-between items-center">
                               <span className="text-white font-mono text-lg">{user.vps?.ipAddress || 'En attente...'}</span>
                               <button onClick={() => copyToClipboard(user.vps?.ipAddress || '', 'ip')} className="text-gray-400 hover:text-white">
                                  {copied === 'ip' ? <span className="text-green-500">Copié!</span> : <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>}
                               </button>
                            </div>
                         </div>
                         <div className="p-4 bg-black/30 rounded-xl border border-gray-800">
                            <span className="text-gray-500 text-sm block mb-1">Nom d&apos;utilisateur</span>
                            <div className="flex justify-between items-center">
                               <span className="text-white font-mono text-lg">{user.vps?.rdpUsername || 'Administrator'}</span>
                               <button onClick={() => copyToClipboard(user.vps?.rdpUsername || 'Administrator', 'username')} className="text-gray-400 hover:text-white">
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                               </button>
                            </div>
                         </div>
                         <div className="p-4 bg-black/30 rounded-xl border border-gray-800">
                            <span className="text-gray-500 text-sm block mb-1">Mot de passe</span>
                            <div className="flex justify-between items-center">
                               <span className="text-white font-mono text-lg">{showRdpPassword ? (user.vps?.rdpPassword || 'P@ssw0rd123!') : '••••••••'}</span>
                               <div className="flex gap-2">
                                 <button onClick={() => setShowRdpPassword(!showRdpPassword)} className="text-gray-400 hover:text-white">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                 </button>
                                 <button onClick={() => copyToClipboard(user.vps?.rdpPassword || 'P@ssw0rd123!', 'password')} className="text-gray-400 hover:text-white">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                 </button>
                               </div>
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="bg-gray-950 p-6 rounded-xl border border-gray-800">
                           <h4 className="font-semibold text-white mb-4">Guide de connexion rapide</h4>
                           <ol className="list-decimal list-inside space-y-3 text-gray-400 text-sm">
                              <li>Ouvrez l&apos;application &quot;Connexion Bureau à distance&quot; sur Windows (ou Microsoft Remote Desktop sur Mac).</li>
                              <li>Entrez l&apos;adresse IP ci-contre.</li>
                              <li>Entrez le nom d&apos;utilisateur (Administrator).</li>
                              <li>Entrez le mot de passe quand demandé.</li>
                           </ol>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {/* Billing */}
          {activeTab === 'billing' && (
             <div className="max-w-3xl">
               <div className="glass-card bg-gray-900 border border-gray-800 rounded-2xl p-6">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                       <h3 className="text-xl font-bold text-white mb-1">Abonnement &amp; Facturation</h3>
                       <p className="text-gray-400 text-sm">Gérez votre abonnement et vos factures</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                       user.subscription?.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-500'
                    }`}>
                       {user.subscription?.status}
                    </span>
                 </div>

                 <div className="p-6 bg-black/40 rounded-xl border border-gray-800 mb-6 flex justify-between items-center">
                    <div>
                       <p className="text-gray-400 text-sm mb-1">Plan actuel</p>
                       <p className="text-2xl font-bold text-white mb-1">{planSpec?.name}</p>
                       <p className="text-green-500 font-medium">{planSpec?.price[user.subscription?.billingCycle || 'monthly']}€ <span className="text-gray-500 text-sm font-normal">/ {user.subscription?.billingCycle === 'monthly' ? 'mois' : 'an'}</span></p>
                    </div>
                    <div className="text-right">
                       <p className="text-gray-400 text-sm mb-1">Prochain paiement</p>
                       <p className="text-white font-medium">{user.subscription?.currentPeriodEnd ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}</p>
                    </div>
                 </div>

                 <div className="flex gap-4">
                    <button 
                      onClick={handleManageBilling}
                      disabled={isLoadingPortal}
                      className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoadingPortal && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      Gérer l&apos;abonnement
                    </button>
                    <button 
                      onClick={handleManageBilling}
                      disabled={isLoadingPortal}
                      className="px-6 py-2 border border-gray-600 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      Historique des factures
                    </button>
                 </div>
               </div>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
