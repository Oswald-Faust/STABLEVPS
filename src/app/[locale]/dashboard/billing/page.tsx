"use client";

import { useState, useEffect, useCallback } from "react";
import { useDashboard } from "../layout";
import { CreditCard, Receipt, Download, Calendar, Wallet, RefreshCcw, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import AddFundsModal from "@/components/dashboard/AddFundsModal";

interface Invoice {
  id: string;
  invoiceNumber: string;
  type: 'wallet_topup' | 'subscription' | 'service';
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  paymentMethod?: {
    type: 'card' | 'bank_transfer' | 'other';
    last4?: string;
    brand?: string;
  };
  paidAt?: string;
  createdAt: string;
  metadata?: {
    previousBalance?: number;
    newBalance?: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function BillingPage() {
  const { user } = useDashboard();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [displayBalance, setDisplayBalance] = useState<number>(user?.balance || 0);
  const [paymentMethod, setPaymentMethod] = useState<{ last4: string; brand: string } | null>(null);
  const [loadingPayment, setLoadingPayment] = useState(true);

  useEffect(() => {
    if (user?.balance !== undefined) {
      setDisplayBalance(user.balance);
    }
  }, [user?.balance]);

  const fetchPaymentMethod = useCallback(async () => {
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      if (res.ok && data.hasPaymentMethod) {
        setPaymentMethod(data.paymentMethod);
      }
    } catch (err) {
      console.error("Error fetching payment method:", err);
    } finally {
      setLoadingPayment(false);
    }
  }, []);

  const fetchInvoices = useCallback(async (page: number = 1) => {
    setLoading(true);
    try {
      let url = `/api/invoices?page=${page}&limit=10`;
      if (filterType) {
        url += `&type=${filterType}`;
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      if (data.success) {
        setInvoices(data.invoices);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  }, [filterType]);

  useEffect(() => {
    fetchInvoices();
    fetchPaymentMethod();
  }, [fetchInvoices, fetchPaymentMethod]);

  const handleBalanceUpdate = (newBalance: number) => {
    setDisplayBalance(newBalance);
    // The layout's useDashboard will also handle updating the user object if it was reactive
    // But since we are using useDashboard(), it depends on how it's implemented.
  };

  const handleDownload = (invoiceId: string) => {
    // Open invoice in new tab for printing/saving
    window.open(`/api/invoices/${invoiceId}/download`, '_blank');
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'wallet_topup': return 'Rechargement';
      case 'subscription': return 'Abonnement';
      case 'service': return 'Service';
      default: return type;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'wallet_topup': return <Wallet className="w-5 h-5 text-green-500" />;
      case 'subscription': return <Calendar className="w-5 h-5 text-blue-500" />;
      default: return <Receipt className="w-5 h-5 text-purple-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-green-500/20 text-green-500',
      pending: 'bg-yellow-500/20 text-yellow-500',
      failed: 'bg-red-500/20 text-red-500',
      refunded: 'bg-gray-500/20 text-gray-400',
    };
    const labels: Record<string, string> = {
      paid: 'Payée',
      pending: 'En attente',
      failed: 'Échouée',
      refunded: 'Remboursée',
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || styles.pending}`}>
        {labels[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Facturation</h1>
        <p className="text-muted text-sm mt-1">Consultez vos factures et moyens de paiement</p>
      </div>

      {/* Billing Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Balance Card */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted text-sm">Solde disponible</p>
              <p className="text-3xl font-bold text-foreground">{displayBalance.toFixed(2)}€ <span className="text-sm font-normal text-muted">EUR</span></p>
            </div>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        {/* Payment Method Card */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <div className="flex items-center justify-between h-full">
            <div className="flex-1">
              <p className="text-muted text-sm mb-2">Moyen de paiement</p>
              {loadingPayment ? (
                <div className="h-10 flex items-center">
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                </div>
              ) : paymentMethod ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-foreground font-semibold capitalize">{paymentMethod.brand} •••• {paymentMethod.last4}</p>
                    <p className="text-xs text-muted">Sera utilisée pour vos abonnements</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-500/10 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-foreground font-medium italic opacity-60 text-sm">Aucune carte enregistrée</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsAddFundsModalOpen(true)}
              className="px-4 py-2 bg-foreground/5 hover:bg-foreground/10 text-foreground text-sm font-medium rounded-lg transition-colors border border-card-border"
            >
              {paymentMethod ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      {user?.subscription && (
        <div className="bg-card border border-card-border rounded-xl p-6">
          <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Abonnement actif
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-muted text-xs uppercase">Plan</p>
              <p className="text-foreground font-semibold capitalize">{user.subscription.planId}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase">Cycle</p>
              <p className="text-foreground font-semibold capitalize">{user.subscription.billingCycle}</p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase">Statut</p>
              <p className={`font-semibold ${user.subscription.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                {user.subscription.status === 'active' ? 'Actif' : user.subscription.status}
              </p>
            </div>
            <div>
              <p className="text-muted text-xs uppercase">Prochain paiement</p>
              <p className="text-foreground font-semibold">
                {user.subscription.currentPeriodEnd 
                  ? new Date(user.subscription.currentPeriodEnd).toLocaleDateString('fr-FR')
                  : '-'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Invoices */}
      <div className="bg-card border border-card-border rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-card-border bg-card-border/30 flex items-center justify-between">
          <h2 className="font-bold text-foreground flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Historique des factures
          </h2>
          <div className="flex items-center gap-2">
            {/* Filter */}
            <select
              value={filterType || ''}
              onChange={(e) => setFilterType(e.target.value || null)}
              className="text-xs bg-background border border-card-border rounded-lg px-3 py-1.5 text-foreground"
            >
              <option value="">Tous les types</option>
              <option value="wallet_topup">Rechargements</option>
              <option value="subscription">Abonnements</option>
              <option value="service">Services</option>
            </select>
            {/* Refresh button */}
            <button 
              onClick={() => fetchInvoices(pagination.page)}
              disabled={loading}
              className="p-2 hover:bg-card-border rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCcw className={`w-4 h-4 text-muted ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-card-border">
          {loading ? (
            <div className="p-8 text-center text-muted">
              <RefreshCcw className="w-6 h-6 animate-spin mx-auto mb-2" />
              Chargement des factures...
            </div>
          ) : invoices.length > 0 ? (
            invoices.map((invoice) => (
              <div key={invoice.id} className="p-4 flex items-center justify-between hover:bg-card-border/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    invoice.type === 'wallet_topup' ? 'bg-green-500/20' : 
                    invoice.type === 'subscription' ? 'bg-blue-500/20' : 'bg-purple-500/20'
                  }`}>
                    {getTypeIcon(invoice.type)}
                  </div>
                  <div>
                    <p className="font-medium text-foreground flex items-center gap-2">
                      {invoice.invoiceNumber}
                      {getStatusBadge(invoice.status)}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(invoice.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })} • {getTypeLabel(invoice.type)}
                      {invoice.paymentMethod?.brand && invoice.paymentMethod?.last4 && (
                        <span className="ml-2">
                          • {invoice.paymentMethod.brand.toUpperCase()} •••• {invoice.paymentMethod.last4}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-foreground">{invoice.amount.toFixed(2)}€</p>
                    <p className="text-xs text-muted">{invoice.currency}</p>
                  </div>
                  <button 
                    onClick={() => handleDownload(invoice.id)}
                    className="p-2 hover:bg-card-border rounded-lg transition-colors group"
                    title="Télécharger la facture"
                  >
                    <Download className="w-4 h-4 text-muted group-hover:text-foreground transition-colors" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-muted">
              <Receipt className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Aucune facture pour le moment</p>
              <p className="text-xs mt-1">Les factures apparaîtront ici après vos rechargements</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-card-border flex items-center justify-between">
            <p className="text-xs text-muted">
              Page {pagination.page} sur {pagination.totalPages} ({pagination.total} factures)
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchInvoices(pagination.page - 1)}
                disabled={pagination.page <= 1 || loading}
                className="p-2 hover:bg-card-border rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4 text-muted" />
              </button>
              <button
                onClick={() => fetchInvoices(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || loading}
                className="p-2 hover:bg-card-border rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4 text-muted" />
              </button>
            </div>
          </div>
        )}
      </div>

      <AddFundsModal 
        isOpen={isAddFundsModalOpen}
        onClose={() => setIsAddFundsModalOpen(false)}
        currentBalance={displayBalance}
        onBalanceUpdate={handleBalanceUpdate}
      />
    </div>
  );
}
