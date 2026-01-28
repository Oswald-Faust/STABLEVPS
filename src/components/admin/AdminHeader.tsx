"use client";

import { Shield, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ThemeToggle';

interface AdminHeaderProps {
  onMenuClick?: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const pathname = usePathname();
  
  const getTitle = () => {
    if (pathname.includes('/support')) return 'Tickets de support';
    if (pathname.includes('/users')) return 'Utilisateurs';
    if (pathname.includes('/settings')) return 'Paramètres';
    if (pathname.includes('/payments')) return 'Paiements';
    return 'Tableau de bord';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-200 dark:border-white/5 px-4 lg:px-8 py-4 flex items-center justify-between transition-colors duration-300">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        
        <h2 className="text-lg lg:text-xl font-bold capitalize text-gray-900 dark:text-white">
          {getTitle()}
        </h2>
      </div>
      
      <div className="flex items-center gap-2 lg:gap-4">
        <ThemeToggle />
        
        <div className="hidden md:flex bg-gray-100 dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-full px-3 lg:px-4 py-2 items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs lg:text-sm font-medium text-gray-900 dark:text-gray-200">En ligne</span>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-4 border-l border-gray-200 dark:border-white/5">
          <div className="text-right hidden sm:block">
            <p className="text-xs lg:text-sm font-bold text-gray-900 dark:text-white">Admin</p>
            <p className="text-[9px] lg:text-[10px] text-gray-500 dark:text-muted-foreground uppercase tracking-widest">Accès Total</p>
          </div>
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-gray-100 dark:bg-white/5 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center">
            <Shield className="w-4 h-4 lg:w-5 lg:h-5 text-green-500" />
          </div>
        </div>
      </div>
    </header>
  );
}
