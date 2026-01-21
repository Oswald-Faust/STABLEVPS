"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Search, 
  ArrowUpDown, 
  Server, 
  ExternalLink, 
  Cpu, 
  HardDrive, 
  MapPin,
  Calendar,
  Zap,
  ChevronDown
} from "lucide-react";
import { PLANS, PlanId } from "@/lib/plans";

interface ServicesListProps {
  services: any[];
  onSelectService?: (service: any) => void; // Made optional for backward compatibility
}

type SortOption = 'newest' | 'oldest' | 'price-high' | 'price-low' | 'expiring-soon';

export default function ServicesList({ services }: ServicesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Filter services based on search query
  const filteredServices = services.filter((service) => {
    const planName = service.vps?.location === 'london' ? 'Exclusive VPS' : 'Standard VPS';
    const ip = service.vps?.ipAddress || '';
    const searchLower = searchQuery.toLowerCase();
    return planName.toLowerCase().includes(searchLower) || ip.includes(searchLower);
  });

  // Sort services based on selected option
  const sortedServices = [...filteredServices].sort((a, b) => {
    const getDate = (s: any) => new Date(s.subscription?.currentPeriodStart || s.createdAt || 0).getTime();
    const getExpiry = (s: any) => new Date(s.subscription?.currentPeriodEnd || 0).getTime();
    const getPrice = (s: any) => {
      const planId = s.subscription?.planId as PlanId;
      const planInfo = PLANS[planId];
      return s.subscription?.billingCycle === 'yearly' ? (planInfo?.yearlyPrice || 0) : (planInfo?.monthlyPrice || 0);
    };

    switch (sortBy) {
      case 'newest':
        return getDate(b) - getDate(a);
      case 'oldest':
        return getDate(a) - getDate(b);
      case 'price-high':
        return getPrice(b) - getPrice(a);
      case 'price-low':
        return getPrice(a) - getPrice(b);
      case 'expiring-soon':
        return getExpiry(a) - getExpiry(b);
      default:
        return 0;
    }
  });

  // Get service URL (using _id, serverId, or index as fallback)
  const getServiceUrl = (service: any, index: number) => {
    const id = service._id?.toString() || service.vps?.serverId || index.toString();
    return `/dashboard/services/${id}`;
  };

  // Get plan name
  const getPlanName = (planId: string) => {
    if (planId === 'basic') return 'Starter VPS';
    if (planId === 'prime') return 'Professional VPS';
    if (planId === 'pro') return 'Enterprise VPS';
    return 'Forex VPS';
  };

  // Get plan specs
  const getPlanSpecs = (planId: string) => {
    const specs = {
      basic: { vcpu: 1, ram: '2.5 GB', storage: '17 GB' },
      prime: { vcpu: 2, ram: '4 GB', storage: '35 GB' },
      pro: { vcpu: 4, ram: '8 GB', storage: '65 GB' }
    };
    return specs[planId as keyof typeof specs] || specs.basic;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Mes Services VPS</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gérez et surveillez tous vos serveurs VPS</p>
        </div>
        <Link 
          href="/dashboard/order"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/30"
        >
          <Zap size={18} />
          Commander un VPS
        </Link>
      </div>

      {/* Search, Sort and View Toggle */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          {/* Search */}
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
              placeholder="Rechercher par nom ou IP..."
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="appearance-none pl-4 pr-10 py-2.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-300 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all cursor-pointer"
              >
                <option value="newest">Plus récent</option>
                <option value="oldest">Plus ancien</option>
                <option value="price-high">Prix ↓</option>
                <option value="price-low">Prix ↑</option>
                <option value="expiring-soon">Expire bientôt</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900/50 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Grille
              </button>
              <button 
                onClick={() => setViewMode('table')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  viewMode === 'table' 
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Liste
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Services Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {sortedServices.length} service{sortedServices.length !== 1 ? 's' : ''} trouvé{sortedServices.length !== 1 ? 's' : ''}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedServices.map((service, idx) => {
            const planId = service.subscription?.planId as PlanId;
            const planInfo = PLANS[planId];
            const price = service.subscription?.billingCycle === 'yearly' ? planInfo?.yearlyPrice : planInfo?.monthlyPrice;
            const specs = getPlanSpecs(planId);
            const isActive = service.status === 'active' || service.subscription?.status === 'active';

            return (
              <Link 
                key={idx} 
                href={getServiceUrl(service, idx)}
                className="group bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Card Header */}
                <div className="p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
                  {/* Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  </div>
                  
                  <div className="relative z-10 flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <Server size={28} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg">{getPlanName(planId)}</h3>
                        <p className="text-gray-400 text-sm font-mono">
                          {service.vps?.ipAddress || 'Provisionnement...'}
                        </p>
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                      isActive ? 'bg-emerald-500' : 'bg-amber-500'
                    } flex items-center gap-1.5`}>
                      <span className={`w-2 h-2 bg-white rounded-full ${isActive ? 'animate-pulse' : ''}`}></span>
                      {isActive ? 'Actif' : 'En attente'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6 space-y-4">
                  {/* Specs */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <Cpu size={18} className="mx-auto text-emerald-500 mb-1" />
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{specs.vcpu} vCPU</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <HardDrive size={18} className="mx-auto text-blue-500 mb-1" />
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{specs.ram}</p>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <MapPin size={18} className="mx-auto text-purple-500 mb-1" />
                      <p className="font-bold text-gray-900 dark:text-white text-sm capitalize">{service.vps?.location || 'NL'}</p>
                    </div>
                  </div>

                  {/* Price & Date */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${price || '0.00'}
                        <span className="text-sm font-normal text-gray-500">/{service.subscription?.billingCycle === 'yearly' ? 'an' : 'mois'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        Expire le
                      </p>
                      <p className="font-medium text-gray-700 dark:text-gray-300 text-sm">
                        {service.subscription?.currentPeriodEnd 
                          ? new Date(service.subscription.currentPeriodEnd).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
                          : 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="pt-2">
                    <div className="w-full py-3 bg-gray-100 dark:bg-gray-700/50 group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-emerald-600 text-gray-600 dark:text-gray-300 group-hover:text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2">
                      Gérer le serveur
                      <ExternalLink size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900 dark:hover:text-white">
                      Service <ArrowUpDown size={12} />
                    </div>
                  </th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide text-center">
                    Adresse IP
                  </th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide text-center">
                    Prix
                  </th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide text-center">
                    Échéance
                  </th>
                  <th className="p-4 font-semibold text-gray-600 dark:text-gray-400 uppercase text-xs tracking-wide text-center">
                    État
                  </th>
                  <th className="p-4 w-32"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {sortedServices.map((service, idx) => {
                  const planId = service.subscription?.planId as PlanId;
                  const planInfo = PLANS[planId];
                  const price = service.subscription?.billingCycle === 'yearly' ? planInfo?.yearlyPrice : planInfo?.monthlyPrice;
                  const isActive = service.status === 'active' || service.subscription?.status === 'active';

                  return (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center">
                            <Server size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{getPlanName(planId)}</p>
                            <p className="text-xs text-gray-500">ID: {service.vps?.serverId || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-mono text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                          {service.vps?.ipAddress || 'En attente'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-gray-900 dark:text-white">${price || '0.00'}</span>
                        <span className="text-xs text-gray-500 block capitalize">
                          {service.subscription?.billingCycle === 'yearly' ? 'par an' : 'par mois'}
                        </span>
                      </td>
                      <td className="p-4 text-center text-gray-600 dark:text-gray-400">
                        {service.subscription?.currentPeriodEnd 
                          ? new Date(service.subscription.currentPeriodEnd).toLocaleDateString('fr-FR')
                          : 'N/A'}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                          isActive 
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                          {isActive ? 'Actif' : 'En attente'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <Link 
                          href={getServiceUrl(service, idx)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-emerald-500/20"
                        >
                          Gérer
                          <ExternalLink size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
            Affichage de {sortedServices.length} sur {services.length} service{services.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Empty State */}
      {sortedServices.length === 0 && (
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Server size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {searchQuery ? 'Aucun service trouvé' : 'Aucun service VPS'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            {searchQuery 
              ? 'Essayez une autre recherche ou consultez tous vos services.'
              : 'Vous n\'avez pas encore de serveur VPS. Commandez votre premier VPS dès maintenant !'}
          </p>
          {!searchQuery && (
            <Link 
              href="/dashboard/order"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/30"
            >
              <Zap size={18} />
              Commander un VPS
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
