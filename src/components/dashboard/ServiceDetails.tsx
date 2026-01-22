"use client";

import { useState } from "react";
import { Box, Lock, Server, Info } from "lucide-react";

interface ServiceDetailsProps {
  service: any;
}

export default function ServiceDetails({ service }: ServiceDetailsProps) {
  /* Cancellation Modal State */
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'options' | 'info'>('info');

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

  if (!service) return null;

  return (
    <div className="space-y-6 relative">
       {/* Cancellation Modal */}
       {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                        <Info size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Confirmer l&apos;annulation ?</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        Êtes-vous sûr de vouloir demander l&apos;annulation de ce service ? <br/>
                        Cela ouvrira automatiquement un <strong>ticket de support prioritaire</strong> pour traiter votre demande.
                    </p>
                    <div className="flex gap-3 w-full">
                        <button 
                            onClick={() => setShowCancelModal(false)}
                            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded font-medium transition-colors"
                            disabled={isCancelling}
                        >
                            Retour
                        </button>
                        <button 
                            onClick={handleCancellation}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-medium transition-colors flex items-center justify-center gap-2"
                            disabled={isCancelling}
                        >
                            {isCancelling ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                    Traitement...
                                </>
                            ) : (
                                "Confirmer l'annulation"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
       )}

       <div>
        <h1 className="text-3xl font-light text-gray-700 dark:text-white">Gestion du produit</h1>
        <div className="text-sm text-gray-500 mt-1">Accueil / Espace client / Mes produits & services / Info-produit</div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
         {/* Main Card */}
         <div className="flex-1 bg-white dark:bg-gray-800 rounded shadow overflow-hidden text-center relative">
            <div className="p-8 pb-16">
                 <div className="w-40 h-40 bg-gray-500 rounded-full mx-auto flex items-center justify-center mb-6 text-white ">
                     <Box size={80} strokeWidth={1} />
                 </div>
                 <h2 className="text-3xl font-bold text-gray-700 dark:text-gray-200 mb-2">Exclusive VPS</h2>
                 <p className="text-gray-500 font-bold mb-8">Regular Forex VPS</p>
            </div>
            
            {/* Active Bar */}
            <div className="bg-green-500 text-white font-bold py-3 uppercase text-sm tracking-wide">
                ACTIF
            </div>

             {/* Cancel Button */}
             <div className="p-6">
                <button 
                  onClick={() => setShowCancelModal(true)}
                  className="bg-red-500 hover:bg-red-600 text-white w-full py-3 rounded text-sm font-bold uppercase transition-colors"
                >
                    Demande d&apos;annulation
                </button>
             </div>
             
             {/* Tabs Header */}
             <div className="flex border-t border-gray-200 dark:border-gray-700 mt-4">
                 <button 
                   onClick={() => setActiveTab('options')}
                   className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'options' ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-t-2 border-green-500 -mt-0.5' : 'bg-gray-50 dark:bg-gray-900 text-gray-500 hover:bg-gray-100'}`}
                 >
                    <Server size={14} /> Options configurables
                 </button>
                 <button 
                   onClick={() => setActiveTab('info')}
                   className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'info' ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-t-2 border-green-500 -mt-0.5' : 'bg-gray-50 dark:bg-gray-900 text-gray-500 hover:bg-gray-100'}`}
                 >
                    <Info size={14} /> Informations supplémentaires
                 </button>
             </div>

             {/* Tab Content */}
             <div className="p-6 text-left border-t border-gray-200 dark:border-gray-700 min-h-[200px]">
                 {activeTab === 'info' && (
                     <div className="grid grid-cols-1 gap-y-4 max-w-lg mx-auto">
                        <div className="grid grid-cols-2 gap-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                            <span className="text-gray-500 text-right pr-4 font-medium dark:text-gray-400">IP Address</span>
                            <span className="text-gray-800 dark:text-white font-medium">{service.vps?.ipAddress || 'Pending...'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-b border-gray-100 dark:border-gray-700 pb-2">
                            <span className="text-gray-500 text-right pr-4 font-medium dark:text-gray-400">Username</span>
                            <span className="text-gray-800 dark:text-white font-medium">{service.vps?.rdpUsername || 'Administrator'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pb-2">
                             <span className="text-gray-500 text-right pr-4 font-medium dark:text-gray-400">Password</span>
                             <span className="text-gray-800 dark:text-white font-medium font-mono">{service.vps?.rdpPassword || '••••••••'}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-4">
                             <span className="text-gray-500 text-right pr-4 font-medium dark:text-gray-400">Broker Name (Optional)</span>
                             <span className="text-gray-800 dark:text-white font-medium">-</span>
                        </div>
                     </div>
                 )}
                 {activeTab === 'options' && (
                     <div className="grid grid-cols-1 gap-y-2 text-sm">
                        <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                             <span className="text-gray-500">Dedicated IP</span>
                              <span>1 Dedicated IP 2.00€ EUR</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                             <span className="text-gray-500">RAM</span>
                             <span>8GB</span>
                        </div>
                         <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                             <span className="text-gray-500">CPU</span>
                             <span>3 Core</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                             <span className="text-gray-500">Disk Space</span>
                             <span>50 GB Disk Space</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 dark:border-gray-700 pb-2">
                             <span className="text-gray-500">Operating System</span>
                             <span>Windows Server 2022</span>
                        </div>
                        <div className="flex justify-between">
                             <span className="text-gray-500">Location</span>
                              <span>UK (London) 4.00€ EUR</span>
                        </div>
                     </div>
                 )}
             </div>
         </div>

         {/* Sidebar Details Info */}
         <div className="w-full lg:w-80 shrink-0 space-y-6">
             <div className="bg-white dark:bg-gray-800 rounded p-6 shadow space-y-4 text-center">
                 <div>
                     <div className="text-xs text-gray-400 font-bold uppercase mb-1">Date d&apos;inscription</div>
                     <div className="text-gray-800 dark:text-gray-200 font-medium">
                        {service.vps?.createdAt 
                          ? new Date(service.vps.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                          : 'N/A'}
                     </div>
                 </div>
                 <div>
                     <div className="text-xs text-gray-400 font-bold uppercase mb-1">Montant récurrent</div>
                     <div className="text-gray-800 dark:text-gray-200 font-medium">{service.subscription?.planId === 'basic' ? '12.49' : (service.subscription?.planId === 'prime' ? '19.49' : '34.49')}€ EUR</div>
                 </div>
                 <div>
                     <div className="text-xs text-gray-400 font-bold uppercase mb-1">Cycle de facturation</div>
                     <div className="text-gray-800 dark:text-gray-200 font-medium capitalize">{service.subscription?.billingCycle || 'Mensuel'}</div>
                 </div>
                  <div>
                     <div className="text-xs text-gray-400 font-bold uppercase mb-1">Date d&apos;échéance</div>
                     <div className="text-gray-800 dark:text-gray-200 font-medium">
                        {service.subscription?.currentPeriodEnd 
                          ? new Date(service.subscription.currentPeriodEnd).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
                          : 'N/A'}
                     </div>
                 </div>
                 <div>
                     <div className="text-xs text-gray-400 font-bold uppercase mb-1">Mode de paiement</div>
                     <div className="text-gray-800 dark:text-gray-200 font-medium">Carte de crédit</div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );
}
