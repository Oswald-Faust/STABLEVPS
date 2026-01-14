"use client";

import { useState, useEffect } from "react";
import { X, CreditCard, DollarSign, CheckCircle, AlertCircle, Plus } from "lucide-react";

interface AddFundsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onBalanceUpdate?: (newBalance: number) => void;
}

interface PaymentMethod {
  last4: string;
  brand: string;
}

const PRESET_AMOUNTS = [10, 25, 50, 100];

export default function AddFundsModal({ isOpen, onClose, currentBalance, onBalanceUpdate }: AddFundsModalProps) {
  const [amount, setAmount] = useState<number>(25);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [loadingPaymentMethod, setLoadingPaymentMethod] = useState(true);
  const [useNewCard, setUseNewCard] = useState(false);

  // Fetch payment method info on mount
  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethod();
      // Reset state when modal opens
      setSuccess(false);
      setError("");
      setNewBalance(null);
      setUseNewCard(false);
    }
  }, [isOpen]);

  const fetchPaymentMethod = async () => {
    setLoadingPaymentMethod(true);
    try {
      const res = await fetch("/api/wallet");
      const data = await res.json();
      if (res.ok) {
        setHasPaymentMethod(data.hasPaymentMethod || false);
        setPaymentMethod(data.paymentMethod || null);
        // Default to saved card if available
        setUseNewCard(false);
      }
    } catch (err) {
      console.error("Error fetching payment method:", err);
    } finally {
      setLoadingPaymentMethod(false);
    }
  };

  const handlePresetClick = (preset: number) => {
    setAmount(preset);
    setIsCustom(false);
    setCustomAmount("");
    setError("");
  };

  const handleCustomChange = (value: string) => {
    setCustomAmount(value);
    setIsCustom(true);
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 5 && num <= 1000) {
      setAmount(num);
      setError("");
    } else if (value !== "") {
      setError("Le montant doit être entre $5 et $1000");
    }
  };

  const handleSubmit = async () => {
    if (amount < 5 || amount > 1000) {
      setError("Le montant doit être entre $5 et $1000");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, useNewCard }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.charged) {
          // Payment was successful with saved card
          setSuccess(true);
          setNewBalance(data.newBalance);
          if (onBalanceUpdate) {
            onBalanceUpdate(data.newBalance);
          }
        } else if (data.checkoutUrl) {
          // Redirect to Stripe Checkout (no saved card or useNewCard is true)
          window.location.href = data.checkoutUrl;
        } else {
          setError(data.error || "Une erreur est survenue");
        }
      } else {
        setError(data.error || "Une erreur est survenue");
      }
    } catch (err) {
      console.error("Error processing payment:", err);
      setError("Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (success && onBalanceUpdate && newBalance !== null) {
      onBalanceUpdate(newBalance);
    }
    setSuccess(false);
    setError("");
    setNewBalance(null);
    onClose();
  };

  if (!isOpen) return null;

  // Success state
  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Paiement réussi !
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              ${amount.toFixed(2)} ont été ajoutés à votre portefeuille.
            </p>
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl mb-6">
              <p className="text-sm text-gray-400">Nouveau solde</p>
              <p className="text-3xl font-bold text-green-500">${newBalance?.toFixed(2)}</p>
            </div>
            <button
              onClick={handleClose}
              className="w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">Recharger le portefeuille</h3>
              <p className="text-xs text-gray-500">Solde actuel: ${currentBalance.toFixed(2)} USD</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Payment Method Selector */}
          {!loadingPaymentMethod && (
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                Moyen de paiement
              </label>
              
              {hasPaymentMethod && paymentMethod ? (
                <div className="space-y-3">
                  {/* Saved Card */}
                  <button 
                    onClick={() => setUseNewCard(false)}
                    className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      !useNewCard 
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500" 
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${!useNewCard ? "border-blue-500" : "border-gray-300"}`}>
                      {!useNewCard && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                    </div>
                    <CreditCard className={`w-5 h-5 ${!useNewCard ? "text-blue-500" : "text-gray-400"}`} />
                    <div className="text-left flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-white capitalize">
                        {paymentMethod.brand} •••• {paymentMethod.last4}
                      </p>
                      <p className="text-xs text-gray-500">Carte enregistrée</p>
                    </div>
                  </button>

                  {/* Add New Card */}
                  <button 
                    onClick={() => setUseNewCard(true)}
                    className={`w-full p-3 rounded-xl border flex items-center gap-3 transition-all ${
                      useNewCard 
                        ? "bg-blue-50 dark:bg-blue-900/20 border-blue-500" 
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-300"
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${useNewCard ? "border-blue-500" : "border-gray-300"}`}>
                      {useNewCard && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />}
                    </div>
                    <div className={`w-5 h-5 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center ${useNewCard ? "text-blue-500" : "text-gray-400"}`}>
                      <Plus size={14} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">Ajouter une nouvelle carte</p>
                      <p className="text-xs text-gray-500">Vous serez redirigé vers Stripe</p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 dark:text-white">Nouvelle carte</p>
                    <p className="text-xs text-gray-500">Paiement sécurisé via Stripe</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Preset amounts */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
              Sélectionnez un montant
            </label>
            <div className="grid grid-cols-4 gap-3">
              {PRESET_AMOUNTS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  className={`py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                    !isCustom && amount === preset
                      ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  ${preset}
                </button>
              ))}
            </div>
          </div>

          {/* Custom amount */}
          <div>
            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
              Ou entrez un montant personnalisé
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="number"
                value={customAmount}
                onChange={(e) => handleCustomChange(e.target.value)}
                placeholder="Montant personnalisé"
                min="5"
                max="1000"
                className={`w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border rounded-xl text-gray-800 dark:text-white outline-none transition-colors ${
                  isCustom && customAmount 
                    ? "border-green-500 ring-2 ring-green-500/20" 
                    : "border-gray-200 dark:border-gray-600 focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                }`}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">Min: $5 • Max: $1,000</p>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* Summary */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500 text-sm">Montant à ajouter</span>
              <span className="text-xl font-bold text-gray-800 dark:text-white">${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">Nouveau solde</span>
              <span className="text-green-500 font-semibold">${(currentBalance + amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || amount < 5 || amount > 1000}
              className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <CreditCard size={18} />
                  {hasPaymentMethod ? `Recharger $${amount.toFixed(2)}` : `Payer $${amount.toFixed(2)}`}
                </>
              )}
            </button>
          </div>

          {/* Security note */}
          <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            Paiement sécurisé par Stripe
          </p>
        </div>
      </div>
    </div>
  );
}
