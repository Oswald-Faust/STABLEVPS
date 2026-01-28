"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  LayoutDashboard, 
  MessageSquare, 
  Settings, 
  Shield,
  LogOut,
  CreditCard,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  openTickets?: number;
  handleLogout: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ openTickets, handleLogout, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return pathname.endsWith('/admin');
    }
    return pathname.includes(path);
  };

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        w-64 bg-white dark:bg-[#111111] border-r border-gray-200 dark:border-white/5 
        flex flex-col fixed inset-y-0 transition-all duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3 group" onClick={handleNavClick}>
            <div className="w-10 h-10 bg-gradient-to-tr from-green-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-105 transition-transform">
              <Shield className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">AdminPanel</h1>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest">StableVPS</p>
            </div>
          </Link>
          
          {/* Mobile close button */}
          <button 
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <SidebarNavItem 
            href="/admin" 
            active={isActive('/admin')} 
            icon={<LayoutDashboard className="w-5 h-5" />} 
            label="Vue d'ensemble" 
            onClick={handleNavClick}
          />
          <SidebarNavItem 
            href="/admin/users" 
            active={isActive('/admin/users')} 
            icon={<Users className="w-5 h-5" />} 
            label="Utilisateurs" 
            onClick={handleNavClick}
          />
          <SidebarNavItem 
            href="/admin/support" 
            active={isActive('/admin/support')} 
            icon={<MessageSquare className="w-5 h-5" />} 
            label="Support" 
            badge={openTickets && openTickets > 0 ? openTickets : undefined}
            onClick={handleNavClick}
          />
          <SidebarNavItem 
            href="/admin/payments" 
            active={isActive('/admin/payments')} 
            icon={<CreditCard className="w-5 h-5" />} 
            label="Paiements" 
            onClick={handleNavClick}
          />
          <SidebarNavItem 
            href="/admin/settings" 
            active={isActive('/admin/settings')} 
            icon={<Settings className="w-5 h-5" />} 
            label="Configuration" 
            onClick={handleNavClick}
          />
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
          <button 
            onClick={() => {
              handleLogout();
              if (onClose) onClose();
            }}
            className="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Déconnexion</span>
          </button>
        </div>
      </aside>
    </>
  );
}

function SidebarNavItem({ href, active, icon, label, badge, onClick }: { href: string, active: boolean, icon: React.ReactNode, label: string, badge?: number, onClick?: () => void }) {
  const pathname = usePathname();
  const segments = pathname.split('/');
  const firstSegment = segments[1];
  
  // Check if the first segment is a valid locale (fr or en)
  // If not (e.g., 'admin'), we're using the default locale without prefix
  const validLocales = ['fr', 'en'];
  const hasLocalePrefix = validLocales.includes(firstSegment);
  
  // Build the full href: with locale prefix if present, without if using default locale
  const fullHref = hasLocalePrefix ? `/${firstSegment}${href}` : href;

  return (
    <Link 
      href={fullHref}
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3.5 rounded-xl transition-all group ${
        active 
          ? 'bg-green-500 text-white dark:text-black font-bold shadow-lg shadow-green-500/20' 
          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      {badge !== undefined && (
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${active ? 'bg-white text-green-600 dark:bg-black dark:text-green-500' : 'bg-red-500 text-white'}`}>
          {badge}
        </span>
      )}
    </Link>
  );
}
