"use client";

import { useDashboard } from "./layout";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export default function DashboardPage() {
  const { user, services, recentTickets } = useDashboard();

  return (
    <DashboardOverview 
      user={user} 
      services={services} 
      recentTickets={recentTickets}
    />
  );
}

