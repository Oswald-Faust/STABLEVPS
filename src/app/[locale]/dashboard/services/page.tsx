"use client";

import { useState } from "react";
import { useDashboard } from "../layout";
import ServicesList from "@/components/dashboard/ServicesList";
import ServiceDetails from "@/components/dashboard/ServiceDetails";

export default function ServicesPage() {
  const { services } = useDashboard();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedService, setSelectedService] = useState<any>(null);

  if (selectedService) {
    return (
      <div>
        <button 
          onClick={() => setSelectedService(null)}
          className="mb-4 text-green-500 hover:text-green-400 flex items-center gap-2"
        >
          ← Retour à la liste
        </button>
        <ServiceDetails service={selectedService} />
      </div>
    );
  }

  return (
    <ServicesList 
      services={services} 
      onSelectService={setSelectedService}
    />
  );
}
