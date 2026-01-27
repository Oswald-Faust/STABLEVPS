"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useDashboard } from "../layout";
import ServicesList from "@/components/dashboard/ServicesList";

export default function ServicesPage() {
  const { services } = useDashboard();
  const searchParams = useSearchParams();
  const router = useRouter();
  const processed = useRef(false);

  useEffect(() => {
    const checkPayment = async () => {
      const success = searchParams.get('success');
      const sessionId = searchParams.get('session_id');

      if (success === 'true' && sessionId && !processed.current) {
        processed.current = true;
        try {
          // Call verification API
          const res = await fetch('/api/stripe/verify-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId }),
          });

          if (res.ok) {
            // Reload to show new service
            window.location.reload();
          }
        } catch (error) {
          console.error("Verification failed", error);
        } finally {
            // Clean URL
            router.replace('/dashboard/services');
        }
      }
    };

    checkPayment();
  }, [searchParams, router]);

  return <ServicesList services={services} />;
}

