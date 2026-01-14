"use client";

import { useEffect, useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  Server, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface User {
  _id: string;
  balance: number;
  vps?: {
    status: string;
  };
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  updatedAt: string;
  user: {
    name: string;
  } | null;
}

export default function AdminOverview() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeVps: 0,
    openTickets: 0,
    totalBalance: 0
  });
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users for stats
      const usersRes = await fetch('/api/admin/users');
      const usersData = await usersRes.json();
      
      let activeVps = 0;
      let totalBalance = 0;
      
      if (usersData.users) {
        activeVps = usersData.users.filter((u: User) => u.vps?.status === 'running' || u.vps?.status === 'active').length;
        totalBalance = usersData.users.reduce((acc: number, u: User) => acc + (u.balance || 0), 0);
      }

      // Fetch tickets
      const ticketsRes = await fetch('/api/admin/tickets?status=all');
      const ticketsData = await ticketsRes.json();
      
      setStats({
        totalUsers: usersData.users?.length || 0,
        activeVps,
        openTickets: ticketsData.counts ? (ticketsData.counts.open + ticketsData.counts.customer_reply) : 0,
        totalBalance
      });

      if (ticketsData.success) {
        setRecentTickets(ticketsData.tickets.slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch overview data', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null; // Let layout handle loading state if initial, or show local spinner

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Utilisateurs" 
          value={stats.totalUsers} 
          icon={<Users className="w-6 h-6" />} 
          color="from-blue-500 to-indigo-600" 
        />
        <StatCard 
          title="VPS Actifs" 
          value={stats.activeVps} 
          icon={<Server className="w-6 h-6" />} 
          color="from-green-500 to-emerald-600" 
        />
        <StatCard 
          title="Demandes Ouvertes" 
          value={stats.openTickets} 
          icon={<MessageSquare className="w-6 h-6" />} 
          color="from-red-500 to-rose-600" 
        />
        <StatCard 
          title="Solde Total Clients" 
          value={`$${stats.totalBalance.toFixed(2)}`} 
          icon={<CheckCircle className="w-6 h-6" />} 
          color="from-amber-500 to-orange-600" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tickets Activity */}
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl transition-colors duration-300">
          <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2 text-green-600 dark:text-green-500">
              <Clock className="w-5 h-5" />
              Tickets Récents
            </h3>
            <button onClick={() => router.push('/admin/support')} className="text-xs text-gray-500 hover:text-black dark:text-muted-foreground dark:hover:text-white transition-colors">Voir tout</button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {recentTickets.map(ticket => (
              <div 
                key={ticket.id} 
                className="p-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors flex items-center justify-between cursor-pointer" 
                onClick={() => router.push(`/admin/support`)}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ticket.status === 'open' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-500' : 'bg-green-100 text-green-600 dark:bg-green-500/10 dark:text-green-500'}`}>
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{ticket.subject}</p>
                    <p className="text-[11px] text-gray-500 dark:text-muted-foreground">{ticket.user?.name || 'Inconnu'} • {ticket.ticketNumber}</p>
                  </div>
                </div>
                <StatusBadge status={ticket.status} />
              </div>
            ))}
            {recentTickets.length === 0 && <div className="p-8 text-center text-gray-500 dark:text-muted-foreground text-sm italic">Aucun ticket pour le moment</div>}
          </div>
        </div>

        {/* System Nodes/Info */}
        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-xl transition-colors duration-300">
          <h3 className="font-bold text-gray-900 dark:text-white mb-6">État du Service</h3>
          <div className="space-y-6">
            <ServiceStatus label="API Frontend" />
            <ServiceStatus label="Base de données" />
            <ServiceStatus label="Connecteur Vultr" />
            <ServiceStatus label="Système de Paiement" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 shadow-lg hover:border-gray-300 dark:hover:border-white/10 transition-all group overflow-hidden relative duration-300">
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-tr ${color} opacity-[0.03] rounded-full group-hover:scale-150 transition-all duration-700`}></div>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 bg-gradient-to-tr ${color} rounded-xl shadow-lg text-white`}>
          {icon}
        </div>
      </div>
      <h4 className="text-gray-500 dark:text-muted-foreground text-[11px] font-bold uppercase tracking-widest mb-1">{title}</h4>
      <p className="text-2xl font-black text-gray-900 dark:text-white">{value}</p>
    </div>
  );
}

function ServiceStatus({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 dark:text-green-500">Operationel</span>
        <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'open': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-xs font-medium border border-yellow-500/20">Ouvert</span>;
    case 'answered': return <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-xs font-medium border border-green-500/20">Répondu</span>;
    case 'customer_reply': return <span className="px-2 py-1 bg-blue-500/20 text-blue-500 rounded-full text-xs font-medium border border-blue-500/20">Client</span>;
    case 'closed': return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-full text-xs font-medium border border-gray-500/20">Fermé</span>;
    default: return <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">{status}</span>;
  }
}
