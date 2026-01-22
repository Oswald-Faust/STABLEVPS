"use client";

import { useState } from "react";
import { useDashboard } from "../layout";
import { PLANS, PlanId, BillingCycle, getPlanPrice } from "@/lib/plans";
import { Check, Server, Cpu, HardDrive, MonitorSmartphone, Wallet, CreditCard, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

// Fixed location: London only
const LOCATION = { id: 'london', name: 'Londres (UK)', flag: '🇬🇧' };

export default function NewOrderPage() {
  const router = useRouter();
  const { user, setUser } = useDashboard();
  
  const [selectedPlan, setSelectedPlan] = useState<PlanId | null>(null);
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');
  const selectedLocation = 'london'; // Fixed to London
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlanData = selectedPlan ? PLANS[selectedPlan] : null;
  const price = selectedPlan ? getPlanPrice(selectedPlan, billingCycle) : 0;
  const userBalance = user?.balance || 0;
  const canPayWithWallet = userBalance >= price;

  const handleSubmit = async () => {
    if (!selectedPlan) {
      setError('Veuillez sélectionner un plan');
      return;
    }

    if (paymentMethod === 'wallet' && !canPayWithWallet) {
      setError('Solde insuffisant. Veuillez recharger votre wallet ou choisir le paiement par carte.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle,
          location: selectedLocation,
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      if (paymentMethod === 'card' && data.checkoutUrl) {
        // Redirect to Stripe checkout
        window.location.href = data.checkoutUrl;
      } else {
        // Wallet payment successful, update user balance and redirect
        if (data.newBalance !== undefined) {
          setUser({ ...user!, balance: data.newBalance });
        }
        router.push('/dashboard/services?success=true');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-foreground">Nouvelle commande</h1>
        <div className="text-sm text-muted mt-1">Accueil / Espace client / Nouvelle commande</div>
      </div>

      {/* Step 1: Select Plan */}
      <div className="bg-card border border-card-border rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-card-border bg-gradient-to-r from-purple-600 to-blue-600">
          <h2 className="text-white font-bold flex items-center gap-2">
            <span className="bg-white text-purple-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Choisissez votre plan VPS
          </h2>
        </div>
        
        {/* Billing Cycle Toggle */}
        <div className="p-4 border-b border-card-border">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-muted hover:bg-gray-200'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all relative ${
                billingCycle === 'yearly'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-muted hover:bg-gray-200'
              }`}
            >
              Annuel
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(PLANS).map(([key, plan]) => {
            const planPrice = getPlanPrice(key as PlanId, billingCycle);
            const isSelected = selectedPlan === key;
            
            return (
              <div
                key={key}
                onClick={() => setSelectedPlan(key as PlanId)}
                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                  isSelected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1">
                    <Check size={14} />
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold text-green-500 mb-1">
                  {planPrice}€
                  <span className="text-sm font-normal text-muted">
                    /{billingCycle === 'monthly' ? 'mois' : 'an'}
                  </span>
                </div>
                <div className="text-sm text-muted mb-4">{plan.platforms} plateformes</div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted">
                    <Cpu size={14} className="text-blue-500" />
                    {plan.specs.cpu}
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <Server size={14} className="text-purple-500" />
                    {plan.specs.ram} RAM
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <HardDrive size={14} className="text-orange-500" />
                    {plan.specs.storage}
                  </div>
                  <div className="flex items-center gap-2 text-muted">
                    <MonitorSmartphone size={14} className="text-green-500" />
                    {plan.specs.os}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Location Info - Fixed to London */}
      <div className="bg-card border border-card-border rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-card-border bg-gradient-to-r from-blue-600 to-cyan-600">
          <h2 className="text-white font-bold flex items-center gap-2">
            <span className="bg-white text-blue-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Localisation du serveur
          </h2>
        </div>
        
        <div className="p-4">
          <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-900/20">
            <div className="text-4xl">{LOCATION.flag}</div>
            <div>
              <div className="font-bold text-foreground text-lg">{LOCATION.name}</div>
              <div className="text-sm text-muted">Tous nos serveurs sont hébergés à Londres pour une latence optimale avec les brokers européens.</div>
            </div>
            <div className="ml-auto bg-green-500 text-white rounded-full p-1.5">
              <Check size={16} />
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Payment Method */}
      <div className="bg-card border border-card-border rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-card-border bg-gradient-to-r from-green-600 to-emerald-600">
          <h2 className="text-white font-bold flex items-center gap-2">
            <span className="bg-white text-green-600 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            Mode de paiement
          </h2>
        </div>
        
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Wallet Payment */}
          <div
            onClick={() => canPayWithWallet && setPaymentMethod('wallet')}
            className={`relative p-6 rounded-xl border-2 transition-all ${
              canPayWithWallet ? 'cursor-pointer hover:shadow-lg' : 'opacity-50 cursor-not-allowed'
            } ${
              paymentMethod === 'wallet'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
            }`}
          >
            {paymentMethod === 'wallet' && (
              <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1">
                <Check size={14} />
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                <Wallet className="text-green-500" size={24} />
              </div>
              <div>
                <div className="font-bold text-foreground">Payer avec mon solde</div>
                <div className="text-sm text-muted">
                  Solde disponible: <span className="text-green-500 font-bold">{userBalance.toFixed(2)}€</span>
                </div>
                {!canPayWithWallet && price > 0 && (
                  <div className="text-xs text-red-500 mt-1">
                    Solde insuffisant ({price}€ requis)
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card Payment */}
          <div
            onClick={() => setPaymentMethod('card')}
            className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
              paymentMethod === 'card'
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
            }`}
          >
            {paymentMethod === 'card' && (
              <div className="absolute top-3 right-3 bg-green-500 text-white rounded-full p-1">
                <Check size={14} />
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                <CreditCard className="text-blue-500" size={24} />
              </div>
              <div>
                <div className="font-bold text-foreground">Payer par carte</div>
                <div className="text-sm text-muted">Visa, Mastercard, etc.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary & Submit */}
      <div className="bg-card border border-card-border rounded-lg shadow overflow-hidden">
        <div className="px-4 py-3 border-b border-card-border bg-card-border/30">
          <h2 className="font-bold text-foreground">Récapitulatif de la commande</h2>
        </div>
        
        <div className="p-4">
          {selectedPlanData ? (
            <div className="space-y-3">
              <div className="flex justify-between text-foreground">
                <span>Plan {selectedPlanData.name}</span>
                <span className="font-bold">{price}€</span>
              </div>
              <div className="flex justify-between text-muted text-sm">
                <span>Cycle de facturation</span>
                <span>{billingCycle === 'monthly' ? 'Mensuel' : 'Annuel'}</span>
              </div>
              <div className="flex justify-between text-muted text-sm">
                <span>Localisation</span>
                <span>{LOCATION.name}</span>
              </div>
              <div className="flex justify-between text-muted text-sm">
                <span>Mode de paiement</span>
                <span>{paymentMethod === 'wallet' ? 'Solde wallet' : 'Carte bancaire'}</span>
              </div>
              
              <div className="border-t border-card-border pt-3 mt-3">
                <div className="flex justify-between text-xl font-bold text-foreground">
                  <span>Total</span>
                  <span className="text-green-500">{price}€ EUR</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted py-4">
              Veuillez sélectionner un plan pour voir le récapitulatif
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={!selectedPlan || loading}
            className={`w-full mt-4 py-3 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 ${
              selectedPlan && !loading
                ? 'bg-green-500 hover:bg-green-600'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Traitement en cours...
              </>
            ) : (
              <>
                Confirmer la commande
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
