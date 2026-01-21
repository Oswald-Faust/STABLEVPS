"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Server, 
  Info, 
  Activity, 
  Network, 
  HardDrive, 
  Clock,
  Cpu,
  MemoryStick,
  Globe,
  Calendar,
  CreditCard,
  Copy,
  Check,
  Eye,
  EyeOff,
  AlertTriangle,
  Power,
  RefreshCw,
  Trash2,
  Monitor,
  Gauge,
  History,
  Settings,
  Box,
  Zap
} from "lucide-react";

interface ServiceDetailPageProps {
  service: any;
  serviceId: string;
}

type TabType = 'info' | 'metrics' | 'network' | 'specifications' | 'billing' | 'history';

export default function ServiceDetailPage({ service, serviceId }: ServiceDetailPageProps) {
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCancellation = async () => {
    try {
      setIsCancelling(true);
      const res = await fetch('/api/tickets/create-cancellation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service._id,
          ipAddress: service.vps?.ipAddress,
          planName: service.vps?.location === 'london' ? 'Exclusive VPS' : 'Standard VPS'
        })
      });
      
      if (res.ok) {
        window.location.href = '/dashboard/support';
      } else {
        alert("Une erreur est survenue lors de la demande d'annulation.");
        setIsCancelling(false);
        setShowCancelModal(false);
      }
    } catch (err) {
      console.error(err);
      alert("Erreur de connexion.");
      setIsCancelling(false);
      setShowCancelModal(false);
    }
  };

  // Get plan details
  const getPlanName = () => {
    const planId = service.subscription?.planId;
    if (planId === 'basic') return 'Starter VPS';
    if (planId === 'prime') return 'Professional VPS';
    if (planId === 'pro') return 'Enterprise VPS';
    return 'Forex VPS';
  };

  const getPlanSpecs = () => {
    const planId = service.subscription?.planId;
    const specs = {
      basic: { vcpu: 1, ram: '2.5 GB', storage: '17 GB', bandwidth: '1000 Mbps' },
      prime: { vcpu: 2, ram: '4 GB', storage: '35 GB', bandwidth: '1000 Mbps' },
      pro: { vcpu: 4, ram: '8 GB', storage: '65 GB', bandwidth: '1000 Mbps' }
    };
    return specs[planId as keyof typeof specs] || specs.basic;
  };

  const getStatusColor = () => {
    const status = service.vps?.status || service.status;
    if (status === 'active') return 'bg-emerald-500';
    if (status === 'provisioning') return 'bg-amber-500';
    if (status === 'suspended') return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getStatusText = () => {
    const status = service.vps?.status || service.status;
    if (status === 'active') return 'En ligne';
    if (status === 'provisioning') return 'Provisionnement';
    if (status === 'suspended') return 'Suspendu';
    return 'Inconnu';
  };

  const specs = getPlanSpecs();

  const tabs = [
    { id: 'info' as TabType, label: 'Info', icon: Info },
    { id: 'metrics' as TabType, label: 'Métriques', icon: Activity },
    { id: 'network' as TabType, label: 'Réseau', icon: Network },
    { id: 'specifications' as TabType, label: 'Spécifications', icon: Server },
    { id: 'billing' as TabType, label: 'Facturation', icon: CreditCard },
    { id: 'history' as TabType, label: 'Historique', icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-rose-600 text-white rounded-full flex items-center justify-center mb-6 shadow-lg shadow-red-500/30">
                <AlertTriangle size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Confirmer l&apos;annulation ?</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                Êtes-vous sûr de vouloir demander l&apos;annulation de ce service ? <br/>
                Cela ouvrira automatiquement un <strong className="text-gray-700 dark:text-gray-300">ticket de support prioritaire</strong> pour traiter votre demande.
              </p>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-xl font-semibold transition-all duration-200"
                  disabled={isCancelling}
                >
                  Retour
                </button>
                <button 
                  onClick={handleCancellation}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-red-500/30"
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Traitement...
                    </>
                  ) : (
                    "Confirmer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Service Info */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-900 dark:to-black rounded-2xl p-6 shadow-2xl border border-gray-700/50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Left: Service Info */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
              <Server size={40} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-white">{getPlanName()}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getStatusColor()} flex items-center gap-1.5 shadow-lg`}>
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  {getStatusText()}
                </span>
              </div>
              <p className="text-gray-400 font-medium">ID: {service.vps?.serverId || serviceId}</p>
              <p className="text-gray-500 text-sm mt-1">
                Créé le {service.vps?.createdAt 
                  ? new Date(service.vps.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Right: Quick Actions */}
          <div className="flex flex-wrap gap-3">
            <button className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 border border-white/10">
              <RefreshCw size={16} />
              Redémarrer
            </button>
            <button className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-200 flex items-center gap-2 border border-white/10">
              <Power size={16} />
              Arrêter
            </button>
            <button 
              onClick={() => setShowCancelModal(true)}
              className="px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 border border-red-500/30"
            >
              <Trash2 size={16} />
              Annuler
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-1.5 flex flex-wrap gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[120px] px-4 py-3 rounded-xl font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50'
            }`}
          >
            <tab.icon size={16} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'info' && (
            <>
              {/* Connection Details */}
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Monitor size={20} className="text-emerald-500" />
                  Détails de connexion
                </h3>
                <div className="space-y-4">
                  {/* IP Address */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Adresse IP</label>
                      <p className="text-lg font-mono font-bold text-gray-900 dark:text-white mt-1">
                        {service.vps?.ipAddress || 'En attente...'}
                      </p>
                    </div>
                    {service.vps?.ipAddress && (
                      <button 
                        onClick={() => copyToClipboard(service.vps.ipAddress, 'ip')}
                        className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-colors"
                      >
                        {copiedField === 'ip' ? <Check size={20} /> : <Copy size={20} />}
                      </button>
                    )}
                  </div>

                  {/* Username */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Nom d&apos;utilisateur</label>
                      <p className="text-lg font-mono font-bold text-gray-900 dark:text-white mt-1">
                        {service.vps?.rdpUsername || 'Administrator'}
                      </p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(service.vps?.rdpUsername || 'Administrator', 'username')}
                      className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-colors"
                    >
                      {copiedField === 'username' ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  </div>

                  {/* Password */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="flex-1">
                      <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Mot de passe</label>
                      <p className="text-lg font-mono font-bold text-gray-900 dark:text-white mt-1">
                        {showPassword 
                          ? (service.vps?.rdpPassword || '••••••••') 
                          : '••••••••••••'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowPassword(!showPassword)}
                        className="p-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 rounded-xl transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                      {service.vps?.rdpPassword && (
                        <button 
                          onClick={() => copyToClipboard(service.vps.rdpPassword, 'password')}
                          className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-xl transition-colors"
                        >
                          {copiedField === 'password' ? <Check size={20} /> : <Copy size={20} />}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* RDP Connection Tip */}
                <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20">
                  <p className="text-sm text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
                    <Zap size={16} className="mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Astuce :</strong> Utilisez Remote Desktop Connection (Windows) ou Microsoft Remote Desktop (Mac) pour vous connecter à votre VPS.
                    </span>
                  </p>
                </div>
              </div>

              {/* Server Details */}
              <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                  <Settings size={20} className="text-emerald-500" />
                  Détails du serveur
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">ID Serveur</label>
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{service.vps?.serverId || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Plan</label>
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-1">{getPlanName()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Datacenter</label>
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-1 capitalize flex items-center gap-2">
                      <span className="text-lg">🇳🇱</span>
                      {service.vps?.location || 'Netherlands'}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Système d&apos;exploitation</label>
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                      <span className="text-lg">🪟</span>
                      Windows Server 2022
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'metrics' && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Activity size={20} className="text-emerald-500" />
                Métriques en temps réel
              </h3>
              
              {/* CPU Usage */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                    <Cpu size={16} /> Utilisation CPU
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">12%</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-500" style={{ width: '12%' }}></div>
                </div>
              </div>

              {/* RAM Usage */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                    <MemoryStick size={16} /> Utilisation RAM
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">45%</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full transition-all duration-500" style={{ width: '45%' }}></div>
                </div>
              </div>

              {/* Disk Usage */}
              <div className="mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                    <HardDrive size={16} /> Utilisation Disque
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">28%</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-400 to-purple-600 rounded-full transition-all duration-500" style={{ width: '28%' }}></div>
                </div>
              </div>

              {/* Network */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                    <Network size={16} /> Bande passante
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">124 MB/s</span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all duration-500" style={{ width: '35%' }}></div>
                </div>
              </div>

              <p className="text-xs text-gray-400 mt-6 text-center">
                Métriques mises à jour toutes les 5 minutes
              </p>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Network size={20} className="text-emerald-500" />
                Détails réseau
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Vitesse du port</label>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">1000 Mbps</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Bande passante</label>
                    <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">Illimitée</p>
                  </div>
                </div>

                {/* IPv4 Address */}
                <div className="p-4 bg-gradient-to-r from-pink-500/10 to-rose-500/10 rounded-xl border border-pink-500/20">
                  <label className="text-xs text-pink-600 dark:text-pink-400 uppercase tracking-wide font-medium">Adresse IPv4</label>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-lg font-mono font-bold text-gray-900 dark:text-white">
                      {service.vps?.ipAddress || 'En attente...'}
                    </p>
                    <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-medium transition-colors text-sm">
                      rDNS
                    </button>
                  </div>
                </div>

                {/* Traffic Stats */}
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-3xl font-bold text-emerald-500 mb-1">↓ 2.4 GB</p>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Entrant (ce mois)</label>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 text-center">
                    <p className="text-3xl font-bold text-blue-500 mb-1">↑ 1.8 GB</p>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Sortant (ce mois)</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'specifications' && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Server size={20} className="text-emerald-500" />
                Spécifications du serveur
              </h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl border border-emerald-500/20 text-center">
                  <Cpu size={32} className="mx-auto text-emerald-500 mb-3" />
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{specs.vcpu}</p>
                  <label className="text-sm text-gray-500 dark:text-gray-400 font-medium">vCPU</label>
                </div>
                <div className="p-6 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-xl border border-blue-500/20 text-center">
                  <MemoryStick size={32} className="mx-auto text-blue-500 mb-3" />
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{specs.ram}</p>
                  <label className="text-sm text-gray-500 dark:text-gray-400 font-medium">RAM</label>
                </div>
                <div className="p-6 bg-gradient-to-br from-purple-500/10 to-violet-500/10 rounded-xl border border-purple-500/20 text-center">
                  <HardDrive size={32} className="mx-auto text-purple-500 mb-3" />
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{specs.storage}</p>
                  <label className="text-sm text-gray-500 dark:text-gray-400 font-medium">NVMe SSD</label>
                </div>
                <div className="p-6 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl border border-orange-500/20 text-center">
                  <Gauge size={32} className="mx-auto text-orange-500 mb-3" />
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{specs.bandwidth}</p>
                  <label className="text-sm text-gray-500 dark:text-gray-400 font-medium">Vitesse réseau</label>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Système d&apos;exploitation</label>
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-1 flex items-center gap-2">
                      <span className="text-lg">🪟</span>
                      Windows Server 2022 x64
                    </p>
                  </div>
                  <div className="text-right">
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Logiciels préinstallés</label>
                    <p className="text-base font-bold text-gray-900 dark:text-white mt-1">MetaTrader 5</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-emerald-500" />
                Détails de facturation
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Payé jusqu&apos;au</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {service.subscription?.currentPeriodEnd 
                        ? new Date(service.subscription.currentPeriodEnd).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
                        : 'N/A'}
                    </p>
                  </div>
                  <button className="text-emerald-500 hover:text-emerald-400 font-medium text-sm flex items-center gap-1">
                    Modifier <Calendar size={14} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Prix</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      €{service.subscription?.planId === 'basic' ? '12.49' : service.subscription?.planId === 'prime' ? '19.49' : '34.49'}
                      <span className="text-sm font-normal text-gray-500"> / mois</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">Renouvellement automatique</label>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                      {service.subscription?.status === 'active' ? 'Activé' : 'Désactivé'}
                    </p>
                  </div>
                  <button className="text-emerald-500 hover:text-emerald-400 font-medium text-sm">
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <History size={20} className="text-emerald-500" />
                Historique des actions
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <Power size={18} className="text-emerald-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">Serveur créé</p>
                    <p className="text-sm text-gray-500">Provisionnement initial du VPS</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {service.vps?.createdAt 
                        ? new Date(service.vps.createdAt).toLocaleString('fr-FR')
                        : 'N/A'}
                    </p>
                  </div>
                </div>

                {service.vps?.status === 'active' && (
                  <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check size={18} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">Serveur actif</p>
                      <p className="text-sm text-gray-500">Le VPS est maintenant opérationnel</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {service.vps?.createdAt 
                          ? new Date(new Date(service.vps.createdAt).getTime() + 300000).toLocaleString('fr-FR')
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Quick Info */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-4">Résumé</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
                  <Calendar size={18} className="text-emerald-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Date de création</label>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {service.vps?.createdAt 
                      ? new Date(service.vps.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                  <Clock size={18} className="text-blue-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Prochaine échéance</label>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">
                    {service.subscription?.currentPeriodEnd 
                      ? new Date(service.subscription.currentPeriodEnd).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                  <CreditCard size={18} className="text-purple-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Cycle de facturation</label>
                  <p className="font-medium text-gray-900 dark:text-white text-sm capitalize">
                    {service.subscription?.billingCycle === 'yearly' ? 'Annuel' : 'Mensuel'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500/10 rounded-xl flex items-center justify-center">
                  <Globe size={18} className="text-orange-500" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 dark:text-gray-400">Localisation</label>
                  <p className="font-medium text-gray-900 dark:text-white text-sm capitalize flex items-center gap-1">
                    <span>🇳🇱</span> {service.vps?.location || 'Netherlands'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Uptime */}
          <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Activity size={24} />
              </div>
              <div>
                <p className="text-white/80 text-sm">Uptime</p>
                <p className="text-3xl font-bold">99.9%</p>
              </div>
            </div>
            <p className="text-sm text-white/70">Dernier mois de fonctionnement</p>
          </div>

          {/* Need Help */}
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
              <Box size={32} className="text-white" />
            </div>
            <h4 className="font-bold text-gray-900 dark:text-white mb-2">Besoin d&apos;aide ?</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Notre équipe support est disponible 24/7</p>
            <Link 
              href="/dashboard/support"
              className="block w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-blue-500/30 text-center"
            >
              Contacter le support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
