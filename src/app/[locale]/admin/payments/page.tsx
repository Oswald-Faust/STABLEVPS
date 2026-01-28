"use client";

import { useEffect, useState } from 'react';
import { 
  CreditCard, 
  Search, 
  Wallet, 
  ArrowUpRight, 
  Filter,
  Trash2
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
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const deleteInvoice = async (id: string, invoiceNumber: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer la facture ${invoiceNumber} ? Cette action est irréversible.`)) {
      return;
    }
    
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/payments?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      
      if (data.success) {
        setInvoices(invoices.filter(inv => inv.id !== id));
        // Recalculate stats
        fetchInvoices();
      } else {
        alert('Erreur: ' + data.error);
      }
    } catch (error) {
      console.error('Failed to delete invoice', error);
      alert('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
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
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-4 lg:p-6 relative overflow-hidden group transition-colors duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl group-hover:bg-green-500/20 transition-all"></div>
              <div className="flex justify-between items-start mb-3 lg:mb-4">
                  <div className="p-2.5 lg:p-3 bg-green-500/10 dark:bg-green-500/20 rounded-xl text-green-600 dark:text-green-500">
                      <CreditCard className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
              </div>
              <h4 className="text-gray-500 dark:text-muted-foreground text-[10px] lg:text-[11px] font-bold uppercase tracking-widest mb-1">Revenu Total</h4>
              <p className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          
          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-4 lg:p-6 relative overflow-hidden group transition-colors duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="flex justify-between items-start mb-3 lg:mb-4">
                  <div className="p-2.5 lg:p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl text-blue-600 dark:text-blue-500">
                      <Wallet className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
              </div>
              <h4 className="text-gray-500 dark:text-muted-foreground text-[10px] lg:text-[11px] font-bold uppercase tracking-widest mb-1">Recharges Wallet</h4>
              <p className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white">${stats.walletRevenue.toFixed(2)}</p>
          </div>

          <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-4 lg:p-6 relative overflow-hidden group transition-colors duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl group-hover:bg-purple-500/20 transition-all"></div>
              <div className="flex justify-between items-start mb-3 lg:mb-4">
                  <div className="p-2.5 lg:p-3 bg-purple-500/10 dark:bg-purple-500/20 rounded-xl text-purple-600 dark:text-purple-500">
                      <ArrowUpRight className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
              </div>
              <h4 className="text-gray-500 dark:text-muted-foreground text-[10px] lg:text-[11px] font-bold uppercase tracking-widest mb-1">Revenus Services</h4>
              <p className="text-xl lg:text-2xl font-black text-gray-900 dark:text-white">${stats.serviceRevenue.toFixed(2)}</p>
          </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-4 lg:space-y-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between sm:items-center">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-muted-foreground w-4 h-4" />
              <input 
                  type="text" 
                  placeholder="Rechercher..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-full pl-11 pr-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-green-500/50 transition-all"
              />
            </div>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white font-bold rounded-lg transition-all text-xs uppercase tracking-widest border border-gray-200 dark:border-white/10 w-full sm:w-auto">
                <Filter className="w-4 h-4" />
                Filtrer
            </button>
        </div>

        {/* Mobile Cards View */}
        <div className="lg:hidden space-y-3">
          {filteredInvoices.map(invoice => (
            <div key={invoice.id} className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-4 transition-colors duration-300">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    invoice.type === 'wallet_topup' 
                      ? 'bg-blue-100 dark:bg-blue-500/10' 
                      : 'bg-purple-100 dark:bg-purple-500/10'
                  }`}>
                    {invoice.type === 'wallet_topup' 
                      ? <Wallet className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                      : <CreditCard className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                    }
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{invoice.userId?.name || 'Inconnu'}</p>
                    <p className="text-[10px] text-gray-500 dark:text-muted-foreground truncate max-w-[140px]">{invoice.userId?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(invoice.status)}
                  <button
                    onClick={() => deleteInvoice(invoice.id, invoice.invoiceNumber)}
                    disabled={deletingId === invoice.id}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                    title="Supprimer"
                  >
                    {deletingId === invoice.id ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-muted-foreground">Montant</p>
                    <p className="font-mono font-bold text-gray-900 dark:text-white">${invoice.amount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-muted-foreground">Type</p>
                    <span className={`text-xs font-bold ${
                      invoice.type === 'wallet_topup' ? 'text-blue-600 dark:text-blue-500' : 'text-purple-600 dark:text-purple-500'
                    }`}>
                      {invoice.type === 'wallet_topup' ? 'Recharge' : 'Abonnement'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-gray-500 dark:text-muted-foreground">Date</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {filteredInvoices.length === 0 && (
            <div className="text-center py-12 text-gray-500 dark:text-muted-foreground">
              Aucune transaction trouvée
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden shadow-xl transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[800px]">
              <thead>
                  <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">ID Transaction</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Utilisateur</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Type</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Montant</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Date</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground">Status</th>
                  <th className="px-6 py-4 text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-muted-foreground text-right">Actions</th>
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
                      <td className="px-6 py-4">
                          {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => deleteInvoice(invoice.id, invoice.invoiceNumber)}
                            disabled={deletingId === invoice.id}
                            className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                            title="Supprimer"
                          >
                            {deletingId === invoice.id ? (
                              <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                      </td>
                  </tr>
                  ))}
              </tbody>
              </table>
            </div>
            {filteredInvoices.length === 0 && (
                <div className="p-12 text-center text-gray-500 dark:text-muted-foreground italic text-sm">Aucune transaction trouvée</div>
            )}
        </div>
      </div>
    </div>
  );
}
