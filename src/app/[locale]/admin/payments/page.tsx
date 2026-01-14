"use client";

import { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Wallet, 
  ArrowUpRight, 
  Filter
} from 'lucide-react';

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  type: string;
  paymentMethod?: {
    brand?: string;
    last4?: string;
  };
  userId?: {
      id: string;
      name: string;
      email: string;
  };
  createdAt: string;
}

export default function AdminPayments() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState({
      totalRevenue: 0,
      walletRevenue: 0,
      serviceRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const res = await fetch('/api/admin/payments?limit=100');
      const data = await res.json();
      if (data.success) {
          setInvoices(data.invoices);
          setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch invoices', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-green-500/20">Payé</span>;
      case 'pending': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-yellow-500/20">En attente</span>;
      case 'failed': return <span className="px-2 py-1 bg-red-500/20 text-red-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-red-500/20">Échoué</span>;
      default: return <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded-full text-[10px] uppercase font-bold tracking-widest">{status}</span>;
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    `${inv.invoiceNumber} ${inv.userId?.name} ${inv.userId?.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden group transition-colors duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
              <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-500/10 dark:bg-green-500/20 rounded-xl text-green-600 dark:text-green-500">
                      <CreditCard className="w-6 h-6" />
                  </div>
              </div>
              <h4 className="text-gray-500 dark:text-muted-foreground text-[11px] font-bold uppercase tracking-widest mb-1">Revenu Total</h4>
              <p className="text-2xl font-black text-gray-900 dark:text-white">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden group transition-colors duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-500">
                      <Wallet className="w-6 h-6" />
                  </div>
              </div>
              <h4 className="text-gray-500 dark:text-muted-foreground text-[11px] font-bold uppercase tracking-widest mb-1">Recharges Wallet</h4>
              <p className="text-2xl font-black text-gray-900 dark:text-white">${stats.walletRevenue.toFixed(2)}</p>
          </div>

          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-6 relative overflow-hidden group transition-colors duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
              <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-500">
                      <ArrowUpRight className="w-6 h-6" />
                  </div>
              </div>
              <h4 className="text-gray-500 dark:text-muted-foreground text-[11px] font-bold uppercase tracking-widest mb-1">Revenus Services</h4>
              <p className="text-2xl font-black text-gray-900 dark:text-white">${stats.serviceRevenue.toFixed(2)}</p>
          </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
            <input 
                type="text" 
                placeholder="Rechercher une transaction..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-full pl-11 pr-4 py-2.5 text-sm md:text-gray-900 dark:text-white focus:outline-none focus:border-green-500/50 transition-all"
            />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white font-bold rounded-lg transition-all text-xs uppercase tracking-widest border border-gray-200 dark:border-white/10">
                <Filter className="w-4 h-4" />
                Filtrer
            </button>
        </div>

        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl transition-colors duration-300">
            <table className="w-full text-left">
            <thead>
                <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">ID Transaction</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Utilisateur</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Type</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Montant</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Date</th>
                <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground text-right">Status</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                             <span className="font-mono text-xs text-gray-600 dark:text-white bg-gray-100 dark:bg-white/5 px-2 py-1 rounded">{invoice.invoiceNumber}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">{invoice.userId?.name || 'Inconnu'}</span>
                            <span className="text-[10px] text-gray-500 dark:text-muted-foreground">{invoice.userId?.email}</span>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                        invoice.type === 'wallet_topup' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500' : 'bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-500'
                    }`}>
                        {invoice.type === 'wallet_topup' ? 'Recharge' : 'Abonnement'}
                    </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-gray-900 dark:text-white font-bold">
                        ${invoice.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500 dark:text-muted-foreground">
                        {new Date(invoice.createdAt).toLocaleDateString()} {new Date(invoice.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="px-6 py-4 text-right">
                        {getStatusBadge(invoice.status)}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
            {filteredInvoices.length === 0 && (
                <div className="p-12 text-center text-gray-500 dark:text-muted-foreground italic text-sm">Aucune transaction trouvée</div>
            )}
        </div>
      </div>
    </div>
  );
}
