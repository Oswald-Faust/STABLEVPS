"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import TopStats from "@/components/dashboard/TopStats";

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  referralCode?: string;
  referredBy?: string;
  balance: number;
  subscription?: {
    planId: string;
    billingCycle: string;
    status: string;
    currentPeriodEnd?: string;
  };
  vps?: {
    ipAddress?: string;
    username?: string;
    password?: string;
    status: string;
    location?: string;
    rdpUsername?: string;
    rdpPassword?: string;
  };
  address?: {
    street?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  };
  services?: any[]; // Array of VPS services
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface Service {
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subscription: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vps: any;
}

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  services: Service[];
  recentTickets: Ticket[];
  loading: boolean;
}

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within DashboardLayout");
  }
  return context;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [ticketCount, setTicketCount] = useState(0);
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/user');
        if (res.ok) {
          const data = await res.json();
          if (data.user) {
            setUser(data.user);
          }
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    const fetchInvoiceCount = async () => {
      try {
        const res = await fetch('/api/invoices?limit=1');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.pagination) {
            setInvoiceCount(data.pagination.total);
          }
        }
      } catch (error) {
        console.error('Failed to fetch invoice count', error);
      }
    };

    const fetchTicketCount = async () => {
      try {
        const res = await fetch('/api/tickets?status=all');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.counts) {
            // Sum all ticket statuses
            const total = (data.counts.open || 0) + 
                         (data.counts.answered || 0) + 
                         (data.counts.customer_reply || 0) + 
                         (data.counts.closed || 0);
            setTicketCount(total);
          }
          // Also store the recent tickets (first 3)
          if (data.tickets) {
            setRecentTickets(data.tickets.slice(0, 3));
          }
        }
      } catch (error) {
        console.error('Failed to fetch ticket count', error);
      }
    };

    fetchUser();
    fetchInvoiceCount();
    fetchTicketCount();
  }, [router]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleUserUpdate = (updatedUser: any) => {
    setUser(updatedUser);
  };

  // Services based on user's services array (supports multiple VPS)
  const newServices: Service[] = user?.services && user.services.length > 0
    ? user.services.map((s: any) => ({
        status: s.vpsStatus || s.status || 'provisioning',
        subscription: {
          planId: s.planId,
          billingCycle: s.billingCycle,
          status: s.status,
          stripeSubscriptionId: s.stripeSubscriptionId,
          currentPeriodStart: s.currentPeriodStart,
          currentPeriodEnd: s.currentPeriodEnd,
        },
        vps: {
          serverId: s.serverId,
          ipAddress: s.ipAddress,
          location: s.location,
          status: s.vpsStatus,
          rdpUsername: s.rdpUsername,
          rdpPassword: s.rdpPassword,
          createdAt: s.createdAt,
        },
        _id: s._id,
      }))
    : [];

  // Legacy service from old subscription field - ONLY if active or has server ID
  // This prevents showing 'pending' registrations as ghost VPS instances.
  const hasActiveLegacy = user?.subscription?.status === 'active' || (user?.vps?.status && user?.vps?.status !== 'provisioning') || user?.vps?.ipAddress;

  const legacyService: Service[] = (user?.subscription && hasActiveLegacy)
    ? [{
        status: user.vps?.status || 'active',
        subscription: user.subscription,
        vps: user.vps
      }] 
    : [];

  // Combine both (filter out legacy if it looks like it's already in new services? 
  // For now, assuming they are distinct sets in this migration phase)
  // Only include legacy if newServices is empty OR if we want to show both (which we do for the bug fix)
  // However, we must be careful not to double count if the legacy one WAS migrated.
  // In this specific case, we know they are distinct. 
  // A simple heuristic: if newServices has items, and legacy exists, show both.
  
  const services: Service[] = [...newServices, ...legacyService];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <DashboardContext.Provider value={{ user, setUser, services, recentTickets, loading }}>
      <div className="min-h-screen bg-background p-4 lg:p-8 font-sans text-foreground">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          
          {/* Left Sidebar */}
          <Sidebar 
            user={user} 
            handleLogout={handleLogout} 
            onUserUpdate={handleUserUpdate}
          />

          {/* Right Content */}
          <div className="flex-1 w-full">
            {/* Top Stats Cards */}
            <TopStats 
              serviceCount={services.length} 
              ticketCount={ticketCount}
              invoiceCount={invoiceCount} 
            />

            {/* Page Content */}
            {children}
          </div>

        </div>
      </div>
    </DashboardContext.Provider>
  );
}
