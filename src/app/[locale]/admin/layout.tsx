"use client";

import { useEffect, useState, createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';

interface AdminContextType {
  openTickets: number;
  refreshStats: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used within AdminLayout');
  return context;
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [openTickets, setOpenTickets] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchStats = async () => {
    try {
      const ticketsRes = await fetch('/api/admin/tickets?status=all');
      const ticketsData = await ticketsRes.json();
      if (ticketsData.success) {
        setOpenTickets(ticketsData.counts.open + ticketsData.counts.customer_reply);
      }
    } catch (error) {
      console.error('Failed to fetch admin stats', error);
    }
  };

  useEffect(() => {
    // Skip check on login page
    if (pathname?.includes('/admin/login')) {
      return;
    }

    const checkAdmin = async () => {
      try {
        const res = await fetch('/api/admin/check');
        if (res.ok) {
          await fetchStats();
          setLoading(false);
        } else {
          router.push('/admin/login');
        }
      } catch (error) {
        console.error('Admin check failed', error);
        router.push('/admin/login');
      }
    };

    checkAdmin();
  }, [router, pathname]);

  // Close sidebar when route changes (for mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout failed', error);
      router.push('/admin/login');
    }
  };

  // If on login page, render children directly without layout
  if (pathname?.includes('/admin/login')) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center transition-colors duration-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <AdminContext.Provider value={{ openTickets, refreshStats: fetchStats }}>
      <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-white flex font-sans transition-colors duration-300">
        <AdminSidebar 
          openTickets={openTickets} 
          handleLogout={handleLogout}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
        
        {/* Main content - no margin on mobile, margin on lg+ */}
        <main className="flex-1 lg:ml-64 overflow-y-auto min-h-screen">
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />
          <div className="p-4 lg:p-8 pb-20">
            {children}
          </div>
        </main>
      </div>
    </AdminContext.Provider>
  );
}
