"use client";

import { useParams, useRouter } from "next/navigation";
import { useDashboard } from "../../layout";
import ServiceDetailPage from "@/components/dashboard/ServiceDetailPage";
import { ArrowLeft } from "lucide-react";

export default function ServiceDetailRoute() {
  const params = useParams();
  const router = useRouter();
  const { services } = useDashboard();
  
  const serviceId = params.serviceId as string;
  
  // Find the service by ID (checking both _id and index fallback)
  const service = services.find((s: any) => {
    // Check if this service has a matching _id
    if (s._id?.toString() === serviceId) return true;
    // Check if serverId matches
    if (s.vps?.serverId === serviceId) return true;
    return false;
  }) || services[parseInt(serviceId)] || null;

  if (!service) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => router.push('/dashboard/services')}
          className="text-emerald-500 hover:text-emerald-400 flex items-center gap-2 font-medium transition-colors"
        >
          <ArrowLeft size={18} />
          Retour aux services
        </button>
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-12 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Service non trouvé</h2>
          <p className="text-gray-500 dark:text-gray-400">Le service demandé n&apos;existe pas ou a été supprimé.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button 
        onClick={() => router.push('/dashboard/services')}
        className="text-emerald-500 hover:text-emerald-400 flex items-center gap-2 font-medium transition-colors group"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        Retour aux services
      </button>
      <ServiceDetailPage service={service} serviceId={serviceId} />
    </div>
  );
}
