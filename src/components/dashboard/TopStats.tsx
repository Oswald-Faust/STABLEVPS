"use client";

import Link from "next/link";
import { Box, ShoppingCart, MessageSquare, CreditCard, ArrowRight } from "lucide-react";

interface TopStatsProps {
  serviceCount: number;
  ticketCount: number;
  invoiceCount: number;
}

export default function TopStats({ serviceCount, ticketCount, invoiceCount }: TopStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Services Card */}
      <Link href="/dashboard/services" className="bg-purple-600 rounded shadow text-white overflow-hidden relative group cursor-pointer hover:bg-purple-700 transition-colors block">
        <div className="p-4 flex justify-between items-start">
          <div>
            <div className="text-4xl font-bold">{serviceCount}</div>
            <div className="text-purple-200 text-xs font-medium uppercase tracking-wider mt-1">SERVICES</div>
          </div>
          <Box size={48} className="text-purple-500 opacity-50" />
        </div>
        <div className="bg-black/10 px-4 py-2 text-xs flex justify-between items-center">
            &nbsp; <ArrowRight size={14} />
        </div>
      </Link>

      {/* Inscriptions (Cart) Card - Links to services/new order */}
      <Link href="/dashboard/services" className="bg-green-500 rounded shadow text-white overflow-hidden relative group cursor-pointer hover:bg-green-600 transition-colors block">
        <div className="p-4 flex justify-between items-start">
          <div>
            <div className="text-4xl font-bold">0</div>
            <div className="text-green-100 text-xs font-medium uppercase tracking-wider mt-1">D&apos;INSCRIPTIONS</div>
          </div>
          <ShoppingCart size={48} className="text-green-400 opacity-50" />
        </div>
        <div className="bg-black/10 px-4 py-2 text-xs flex justify-between items-center">
             &nbsp; <ArrowRight size={14} />
        </div>
      </Link>

      {/* Demandes (Tickets) Card */}
      <Link href="/dashboard/support" className="bg-red-500 rounded shadow text-white overflow-hidden relative group cursor-pointer hover:bg-red-600 transition-colors block">
        <div className="p-4 flex justify-between items-start">
          <div>
            <div className="text-4xl font-bold">{ticketCount}</div>
            <div className="text-red-100 text-xs font-medium uppercase tracking-wider mt-1">DEMANDES</div>
          </div>
          <MessageSquare size={48} className="text-red-400 opacity-50" />
        </div>
        <div className="bg-black/10 px-4 py-2 text-xs flex justify-between items-center">
             &nbsp; <ArrowRight size={14} />
        </div>
      </Link>

      {/* Factures Card */}
      <Link href="/dashboard/billing" className="bg-cyan-500 rounded shadow text-white overflow-hidden relative group cursor-pointer hover:bg-cyan-600 transition-colors block">
        <div className="p-4 flex justify-between items-start">
          <div>
            <div className="text-4xl font-bold">{invoiceCount}</div>
            <div className="text-cyan-100 text-xs font-medium uppercase tracking-wider mt-1">FACTURES</div>
          </div>
          <CreditCard size={48} className="text-cyan-400 opacity-50" />
        </div>
        <div className="bg-black/10 px-4 py-2 text-xs flex justify-between items-center">
             &nbsp; <ArrowRight size={14} />
        </div>
      </Link>
    </div>
  );
}

