"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  CreditCard, 
  Server, 
  MessageSquare, 
  ArrowLeft, 
  Clock, 
  DollarSign,
  Mail,
  MapPin
} from 'lucide-react';

interface Service {
  _id: string;
  planId: string;
  status: string;
  ipAddress?: string;
  vpsStatus?: string;
  billingCycle: string;
  currentPeriodEnd?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  updatedAt: string;
}

interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  balance: number;
  role: string;
  createdAt: string;
  totalSpent: number;
  services: Service[];
  address?: {
    line1?: string;
    city?: string;
    country?: string;
  };
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchUserDetails(params.id as string);
    }
  }, [params.id]);

  const fetchUserDetails = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`);
      const data = await res.json();
      if (data.success) {
        setUser(data.user);
        setInvoices(data.invoices);
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Failed to fetch user details', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-green-500/10 text-green-500 border-green-500/20',
      paid: 'bg-green-500/10 text-green-500 border-green-500/20',
      open: 'bg-green-500/10 text-green-500 border-green-500/20',
      provisioning: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      answered: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      closed: 'bg-gray-500/10 text-gray-500 border-gray-500/20',
      failed: 'bg-red-500/10 text-red-500 border-red-500/20',
      canceled: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${styles[status] || 'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
    </div>;
  }

  if (!user) {
    return <div className="text-center p-12">
      <p className="text-xl">Utilisateur introuvable</p>
      <p className="text-sm text-muted-foreground mt-2">ID demandé: {params.id}</p>
    </div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-muted-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-3 text-gray-900 dark:text-white">
            {user.firstName} {user.lastName}
            <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500 text-white' : 'bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-muted-foreground'}`}>
              {user.role}
            </span>
          </h1>
          <p className="text-gray-500 dark:text-muted-foreground text-sm flex items-center gap-2 mt-1">
            <Mail className="w-3 h-3" /> {user.email} • ID: {user.id}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between group hover:border-gray-300 dark:hover:border-white/10 transition-colors duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-500 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <h4 className="text-gray-500 dark:text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Solde Actuel</h4>
          <p className="text-2xl font-black text-gray-900 dark:text-white">${user.balance.toFixed(2)}</p>
        </div>

        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between group hover:border-gray-300 dark:hover:border-white/10 transition-colors duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-500 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h4 className="text-gray-500 dark:text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Total Dépensé</h4>
          <p className="text-2xl font-black text-gray-900 dark:text-white">${user.totalSpent.toFixed(2)}</p>
        </div>

        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between group hover:border-gray-300 dark:hover:border-white/10 transition-colors duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-500 rounded-xl">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <h4 className="text-gray-500 dark:text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Services Actifs</h4>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{user.services.length}</p>
        </div>

        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 flex flex-col justify-between group hover:border-gray-300 dark:hover:border-white/10 transition-colors duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-500 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
          <h4 className="text-gray-500 dark:text-muted-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Tickets Support</h4>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{tickets.length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Services */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Services */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <Server className="w-5 h-5 text-green-600 dark:text-green-500" />
              Services VPS
            </h3>
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
              <table className="w-full text-left">
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                  {user.services.length > 0 ? user.services.map((service, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 dark:text-white capitalize">{service.planId} VPS</span>
                          <span className="text-xs text-gray-500 dark:text-muted-foreground">{service.ipAddress || 'En attente d\'IP'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-500 dark:text-muted-foreground">
                          <Clock className="w-3 h-3" /> 
                          {service.billingCycle}
                        </div>
                        {service.currentPeriodEnd && (
                          <div className="text-xs text-gray-500 dark:text-muted-foreground mt-1">
                            Fin: {new Date(service.currentPeriodEnd).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {getStatusBadge(service.vpsStatus || service.status)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500 dark:text-muted-foreground italic">
                        Aucun service actif pour cet utilisateur
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transactions */}
          <div>
             <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
               <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-500" />
               Historique des transactions
             </h3>
             <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm transition-colors duration-300">
               <table className="w-full text-left">
                 <thead className="bg-gray-50 dark:bg-white/5">
                   <tr>
                     <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Facture</th>
                     <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Date</th>
                     <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Montant</th>
                     <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground text-right">Status</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                   {invoices.length > 0 ? invoices.map((inv) => (
                     <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                       <td className="px-6 py-4 font-mono text-xs text-gray-900 dark:text-white">{inv.invoiceNumber}</td>
                       <td className="px-6 py-4 text-xs text-gray-500 dark:text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</td>
                       <td className="px-6 py-4 font-bold text-gray-900 dark:text-white">${inv.amount.toFixed(2)}</td>
                       <td className="px-6 py-4 text-right">{getStatusBadge(inv.status)}</td>
                     </tr>
                   )) : (
                     <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-muted-foreground italic">
                          Aucune transaction enregistrée
                        </td>
                     </tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>

        {/* Right Column - Info & Tickets */}
        <div className="space-y-8">
          
          {/* User Address Info */}
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-sm transition-colors duration-300">
            <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground mb-4">Informations Client</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-green-600 dark:text-green-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">Adresse</p>
                  <p className="text-xs text-gray-500 dark:text-muted-foreground">
                    {user.address?.line1 || 'Aucune adresse renseignée'} <br />
                    {user.address?.city} {user.address?.country}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                 <Clock className="w-4 h-4 text-blue-600 dark:text-blue-500 mt-1" />
                 <div>
                   <p className="text-sm text-gray-900 dark:text-white font-medium">Client depuis le</p>
                   <p className="text-xs text-gray-500 dark:text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Recent Tickets */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <MessageSquare className="w-5 h-5 text-orange-600 dark:text-orange-500" />
              Derniers Tickets
            </h3>
            <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden divide-y divide-gray-100 dark:divide-white/5 shadow-sm transition-colors duration-300">
              {tickets.length > 0 ? tickets.map(ticket => (
                <div key={ticket.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => router.push('/admin/support')}>
                   <div className="flex justify-between items-start mb-2">
                      <span className="font-mono text-[10px] text-gray-500 dark:text-muted-foreground">#{ticket.ticketNumber}</span>
                      {getStatusBadge(ticket.status)}
                   </div>
                   <p className="text-sm font-bold text-gray-900 dark:text-white mb-1 line-clamp-1">{ticket.subject}</p>
                   <p className="text-xs text-gray-500 dark:text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {new Date(ticket.updatedAt).toLocaleDateString()}
                   </p>
                </div>
              )) : (
                 <div className="p-6 text-center text-gray-500 dark:text-muted-foreground italic text-sm">
                   Aucun ticket
                 </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
