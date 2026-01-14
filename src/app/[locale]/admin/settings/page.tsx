"use client";

import { Settings } from 'lucide-react';

export default function AdminSettings() {
  return (
    <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors duration-300">
      <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Settings className="w-10 h-10 text-green-600 dark:text-green-500" />
      </div>
      <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Configuration Système</h3>
      <p className="max-w-md mx-auto text-gray-500 dark:text-muted-foreground">
        Ici vous pourrez bientôt configurer les prix des plans, les clés d&apos;API Vultr et les paramètres de facturation Stripe.
      </p>
    </div>
  );
}
