"use client";

import { Search, ArrowUpDown } from "lucide-react";
import { PLANS, PlanId } from "@/lib/plans";

interface ServicesListProps {
  services: any[];
  onSelectService: (service: any) => void;
}

export default function ServicesList({ services, onSelectService }: ServicesListProps) {
  return (
    <div className="space-y-6">
       <div>
        <h1 className="text-3xl font-light text-gray-700 dark:text-white">Mes produits & services</h1>
        <div className="text-sm text-gray-500 mt-1">Accueil / Espace client / Mes produits & services</div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded shadow overflow-hidden">
         {/* Table Header / Toolbar */}
         <div className="bg-gray-700 p-4 flex flex-col md:flex-row justify-between items-center gap-4 text-white">
            <div className="text-sm">1 de {services.length} / {services.length}</div>
            <div className="flex bg-white rounded overflow-hidden w-full md:w-auto">
                <input 
                    type="text" 
                    className="px-4 py-2 text-gray-800 text-sm outline-none w-full md:w-64"
                    placeholder="Rechercher..."
                />
                <button className="px-3 text-gray-500 hover:text-gray-700">
                    <Search size={16} />
                </button>
            </div>
         </div>

         {/* Table */}
         <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                 <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 font-bold uppercase text-xs">
                     <tr>
                         <th className="p-4 flex items-center gap-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                             Produit/Service <ArrowUpDown size={12} />
                         </th>
                         <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-center">
                             Prix <ArrowUpDown size={12} className="inline ml-1" />
                         </th>
                         <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-center">
                             Date d&apos;échéance <ArrowUpDown size={12} className="inline ml-1" />
                         </th>
                         <th className="p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-center">
                             État <ArrowUpDown size={12} className="inline ml-1" />
                         </th>
                         <th className="p-4 w-20"></th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                     {services.map((service, idx) => {
                         const planName = service.vps?.location === 'london' ? 'Exclusive VPS' : 'Standard VPS';
                         const planId = service.subscription?.planId as PlanId;
                         const planInfo = PLANS[planId];
                         const price = service.subscription?.billingCycle === 'yearly' ? planInfo?.yearlyPrice : planInfo?.monthlyPrice;

                         return (
                             <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                 <td className="p-4 font-bold text-gray-700 dark:text-gray-200">
                                     {planName}
                                     <div className="font-normal text-xs text-gray-500 mt-0.5">
                                         {service.vps?.ipAddress || service.vps?.status}
                                     </div>
                                 </td>
                                 <td className="p-4 text-center">
                                     <div className="font-bold text-gray-700 dark:text-gray-200">${price || '0.00'} USD</div>
                                     <div className="text-xs text-gray-500 capitalize">{service.subscription?.billingCycle || 'Mensuel'}</div>
                                 </td>
                                 <td className="p-4 text-center">
                                     {service.subscription?.currentPeriodEnd ? new Date(service.subscription.currentPeriodEnd).toLocaleDateString('fr-FR') : 'N/A'}
                                 </td>
                                 <td className="p-4 text-center">
                                     <span className={`px-3 py-1 text-xs font-bold uppercase border rounded ${
                                        service.status === 'active' || service.subscription?.status === 'active'
                                        ? 'bg-white border-green-500 text-green-500' // Matches screenshot style (White with green border/text)
                                        : 'bg-white border-yellow-500 text-yellow-500'
                                     }`}>
                                         {service.status === 'active' || service.subscription?.status === 'active' ? 'Actif' : 'En attente'}
                                     </span>
                                 </td>
                                 <td className="p-4 text-center">
                                     <button 
                                        onClick={() => onSelectService(service)}
                                        className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded font-medium transition-colors"
                                    >
                                        Gérer
                                     </button>
                                 </td>
                             </tr>
                         );
                     })}
                 </tbody>
             </table>
         </div>
         
         {/* Footer / Pagination */}
         <div className="bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 p-3 text-xs text-gray-500 text-center">
            Affichage de 1 à {services.length} sur {services.length} éléments
         </div>
      </div>
    </div>
  );
}
