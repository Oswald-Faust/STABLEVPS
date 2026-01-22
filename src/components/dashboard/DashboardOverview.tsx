"use client";

import Link from "next/link";
import { Search, Box, Ticket, Users, Rocket, ArrowRight } from "lucide-react";

interface TicketData {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardOverviewProps {
  user: any;
  services: any[];
  recentTickets: TicketData[];
}

export default function DashboardOverview({ user, services, recentTickets }: DashboardOverviewProps) {
  // Filter active services
  const activeServices = services.filter(s => s.status === 'active' || s.status === 'provisioning');

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-green-500 text-white',
      answered: 'bg-blue-500 text-white',
      customer_reply: 'bg-orange-500 text-white',
      closed: 'bg-gray-800 text-white',
    };
    const labels: Record<string, string> = {
      open: 'Ouvert',
      answered: 'Répondu',
      customer_reply: 'En attente',
      closed: 'Fermé',
    };
    return (
      <span className={`px-1.5 py-0.5 rounded text-xs ${styles[status] || 'bg-gray-500 text-white'}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-foreground">Bienvenue, {user?.firstName}</h1>
        <div className="text-sm text-muted mt-1">Accueil / Espace client</div>
      </div>

     {/* Search Bar */}
      <div className="relative">
         <input 
           type="text" 
           placeholder="Interrogez notre base de connaissances..." 
           className="w-full bg-card border border-card-border shadow-sm rounded p-4 pl-12 text-foreground focus:ring-2 focus:ring-blue-500 outline-none"
         />
         <Search className="absolute left-4 top-4 text-muted" size={20} />
      </div>

      {/* New Order CTA Banner */}
      <Link 
        href="/dashboard/order"
        className="block bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all hover:scale-[1.01] group"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-full">
              <Rocket className="text-white" size={28} />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Commander un nouveau VPS</h3>
              <p className="text-white/80 text-sm">Déployez un serveur en quelques clics • Payez avec votre solde</p>
            </div>
          </div>
          <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
            <ArrowRight className="text-white" size={20} />
          </div>
        </div>
      </Link>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Services */}
        <div className="bg-card border border-card-border rounded shadow overflow-hidden">
             <div className="px-4 py-3 border-b border-card-border flex justify-between items-center bg-card-border/30">
                <Link href="/dashboard/services" className="font-bold text-foreground flex items-center gap-2 hover:text-purple-500 transition-colors">
                    <Box size={18} /> Vos produits/services actifs
                </Link>
                <Link 
                  href="/dashboard/services"
                  className="bg-orange-400 hover:bg-orange-500 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                >
                    + Afficher tout
                </Link>
             </div>
             <div className="divide-y divide-card-border">
                {activeServices.length > 0 ? activeServices.slice(0, 5).map((service, idx) => (
                    <Link key={idx} href="/dashboard/services" className="p-4 hover:bg-card-border/20 transition-colors cursor-pointer flex justify-between items-center block">
                        <div>
                           <div className="font-bold text-foreground">{service.vps?.location === 'london' ? 'Exclusive VPS' : 'VPS Standard'}</div>
                           <div className="text-xs text-muted">{service.vps?.ipAddress || 'En attente d\'IP'}</div>
                        </div>
                        <div className={`px-2 py-1 border rounded text-xs font-bold uppercase ${
                          service.status === 'active' 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                        }`}>
                            {service.status === 'active' ? 'Actif' : 'En attente'}
                        </div>
                    </Link>
                )) : (
                    <div className="p-6 text-center text-gray-500 italic">Aucun service actif</div>
                )}
             </div>
        </div>

        {/* Support Tickets */}
        <div className="bg-card border border-card-border rounded shadow overflow-hidden">
             <div className="px-4 py-3 border-b border-card-border flex justify-between items-center bg-card-border/30">
                <Link href="/dashboard/support" className="font-bold text-foreground flex items-center gap-2 hover:text-red-500 transition-colors">
                    <Ticket size={18} /> Dernières demandes
                </Link>
                <Link 
                  href="/dashboard/support/new"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors"
                >
                    + Ouvrir une demande
                </Link>
             </div>
             <div className="divide-y divide-card-border">
                {recentTickets.length > 0 ? recentTickets.map((ticket) => (
                    <Link 
                      key={ticket.id} 
                      href={`/dashboard/support/${ticket.id}`} 
                      className="p-4 flex gap-4 hover:bg-card-border/20 transition-colors block"
                    >
                        <div className="text-muted text-xs mt-1">#{ticket.ticketNumber}</div>
                        <div className="flex-1">
                            <div className="font-bold text-foreground text-sm line-clamp-1">{ticket.subject}</div>
                            <div className="text-xs text-muted mt-1">
                              Status: {getStatusBadge(ticket.status)}
                            </div>
                        </div>
                    </Link>
                )) : (
                    <div className="p-6 text-center text-gray-500 italic">Aucune demande pour le moment</div>
                )}
             </div>
        </div>
        
        {/* Affiliate (Full width if odd number of items above, or standard) */}
        <div className="bg-card border border-card-border rounded shadow overflow-hidden lg:col-span-2">
             <div className="px-4 py-3 border-b border-card-border flex justify-between items-center bg-card-border/30">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                    <Users size={18} /> Programme d&apos;affiliation
                </h3>
                <button className="bg-teal-500 hover:bg-teal-600 text-white px-3 py-1 rounded text-xs font-medium transition-colors">
                    + Plus de détails
                </button>
             </div>
             <div className="p-6 text-muted text-sm">
                Your current commission balance is 0.00€ EUR. You may withdraw your earnings now.
             </div>
        </div>

     </div>
    </div>
  );
}


