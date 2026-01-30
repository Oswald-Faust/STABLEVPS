import { useState } from "react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { LogOut, Plus, ShoppingCart, Sun, Moon, User as UserIcon, ChevronDown, ChevronUp, Home, Server, CreditCard, Headphones, Gift } from "lucide-react";
import UserInfoModal from "./UserInfoModal";
import AddFundsModal from "./AddFundsModal";

interface SidebarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: any;
  handleLogout: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUserUpdate: (updatedUser: any) => void;
}

export default function Sidebar({ user, handleLogout, onUserUpdate }: SidebarProps) {
  const { theme, setTheme } = useTheme();
  
  const [expanded, setExpanded] = useState({
    credit: true,
    info: true,
    appearance: true,
    shortcuts: true
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddFundsModalOpen, setIsAddFundsModalOpen] = useState(false);
  const [displayBalance, setDisplayBalance] = useState<number>(user?.balance || 0);

  const toggleWidget = (key: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleBalanceUpdate = (newBalance: number) => {
    setDisplayBalance(newBalance);
    // Also update user object
    if (onUserUpdate && user) {
      onUserUpdate({ ...user, balance: newBalance });
    }
  };

  return (
    <>
    <aside className="w-full lg:w-1/4 space-y-6">
      {/* Credit Balance Widget */}
      <div className="bg-card border border-card-border rounded shadow p-0 overflow-hidden">
        <div 
            onClick={() => toggleWidget('credit')}
            className="bg-card-border/30 px-4 py-3 border-b border-card-border flex justify-between items-center cursor-pointer transition-colors"
        >
          <span className="text-foreground font-medium text-sm">Solde de crédit disponible</span>
          {expanded.credit ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
        {expanded.credit && (
            <div className="p-4 text-center">
            <div className="text-3xl font-bold text-foreground mb-1">{displayBalance.toFixed(2)}€</div>
            <div className="text-xs text-muted mb-4">EUR</div>
            <button 
                onClick={() => setIsAddFundsModalOpen(true)}
                className="w-full py-2.5 bg-green-500 hover:bg-green-600 text-white font-medium rounded text-sm transition-colors flex items-center justify-center gap-2"
            >
                <Plus size={16} /> Ajouter des fonds
            </button>
            </div>
        )}
      </div>

      {/* User Info Widget */}
      <div className="bg-card border border-card-border rounded shadow p-0 overflow-hidden">
        <div 
            onClick={() => toggleWidget('info')}
            className="bg-card-border/30 px-4 py-3 border-b border-card-border flex justify-between items-center cursor-pointer transition-colors"
        >
          <span className="text-foreground font-medium text-sm">Vos informations</span>
          {expanded.info ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
        {expanded.info && (
            <div className="p-4">
            <div className="text-muted text-sm mb-4">
                <p className="font-bold text-foreground mb-2">{user?.firstName} {user?.lastName}</p>
                <div className="text-muted text-xs space-y-1">
                    <p>{user?.email}</p>
                    {user?.address?.street ? (
                        <>
                            <p>{user.address.street}</p>
                            <p>{user.address.zipCode} {user.address.city}</p>
                            <p>{user.address.country}</p>
                        </>
                    ) : (
                        <p className="italic opacity-70 mt-2">Aucune adresse enregistrée</p>
                    )}
                </div>
            </div>
            <button 
                onClick={() => setIsEditModalOpen(true)}
                className="w-full py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded text-sm transition-colors flex items-center justify-center gap-2"
            >
                <UserIcon size={16} /> Mettre à jour
            </button>
            </div>
        )}
      </div>

       {/* Theme Toggle Widget */}
       <div className="bg-card border border-card-border rounded shadow p-0 overflow-hidden">
        <div 
            onClick={() => toggleWidget('appearance')}
            className="bg-card-border/30 px-4 py-3 border-b border-card-border flex justify-between items-center cursor-pointer transition-colors"
        >
          <span className="text-foreground font-medium text-sm">Apparence</span>
          {expanded.appearance ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
        {expanded.appearance && (
            <div className="p-4">
            <div className="flex bg-gray-100 dark:bg-gray-900 rounded p-1">
                <button 
                    onClick={() => setTheme("light")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors ${theme === 'light' ? 'bg-white text-blue-600 shadow' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    <Sun size={16} /> Light
                </button>
                <button 
                    onClick={() => setTheme("dark")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-gray-700 text-white shadow' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
                >
                    <Moon size={16} /> Dark
                </button>
            </div>
            </div>
        )}
      </div>

      {/* Navigation Widget */}
      <div className="bg-card border border-card-border rounded shadow p-0 overflow-hidden">
        <div 
            onClick={() => toggleWidget('shortcuts')}
            className="bg-card-border/30 px-4 py-3 border-b border-card-border flex justify-between items-center cursor-pointer transition-colors"
        >
          <span className="text-foreground font-medium text-sm">Navigation</span>
          {expanded.shortcuts ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
        </div>
        {expanded.shortcuts && (
            <div className="p-0">
            <Link 
                href="/dashboard"
                className="w-full text-left px-4 py-3 text-muted hover:bg-card-border/50 text-sm border-b border-card-border flex items-center gap-3"
            >
                <Home size={16} /> Accueil
            </Link>
            <Link 
                href="/dashboard/services"
                className="w-full text-left px-4 py-3 text-muted hover:bg-card-border/50 text-sm border-b border-card-border flex items-center gap-3"
            >
                <Server size={16} /> Mes services
            </Link>
            <Link 
                href="/dashboard/billing"
                className="w-full text-left px-4 py-3 text-muted hover:bg-card-border/50 text-sm border-b border-card-border flex items-center gap-3"
            >
                <CreditCard size={16} /> Facturation
            </Link>
            <Link 
                href="/dashboard/support"
                className="w-full text-left px-4 py-3 text-muted hover:bg-card-border/50 text-sm border-b border-card-border flex items-center gap-3"
            >
                <Headphones size={16} /> Support
            </Link>
            <Link 
                href="/dashboard/affiliation"
                className="w-full text-left px-4 py-3 text-muted hover:bg-card-border/50 text-sm border-b border-card-border flex items-center gap-3"
            >
                <Gift size={16} /> Affiliation
            </Link>
            <Link 
                href="/dashboard/order"
                className="w-full text-left px-4 py-3 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 text-sm border-b border-card-border flex items-center gap-3 font-medium"
            >
                <ShoppingCart size={16} /> Commander un nouveau service
            </Link>
            <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-muted hover:bg-card-border/50 text-sm flex items-center gap-3"
            >
                <LogOut size={16} /> Quitter
            </button>
            </div>
        )}
      </div>
    </aside>

    <UserInfoModal 
        user={user}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onUpdate={onUserUpdate}
    />

    <AddFundsModal
        isOpen={isAddFundsModalOpen}
        onClose={() => setIsAddFundsModalOpen(false)}
        currentBalance={displayBalance}
        onBalanceUpdate={handleBalanceUpdate}
    />
    </>
  );
}

