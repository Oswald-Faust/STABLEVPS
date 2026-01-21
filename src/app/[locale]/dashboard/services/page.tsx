"use client";

import { useDashboard } from "../layout";
import ServicesList from "@/components/dashboard/ServicesList";

export default function ServicesPage() {
  const { services } = useDashboard();

  return <ServicesList services={services} />;
}

