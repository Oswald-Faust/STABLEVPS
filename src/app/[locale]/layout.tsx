import type { Metadata } from "next";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  const titles = {
    fr: "STABLEVPS - VPS Premium pour le Trading Forex | Latence Ultra-Faible",
    en: "STABLEVPS - Premium Forex Trading VPS | Ultra-Low Latency"
  };
  
  const descriptions = {
    fr: "STABLEVPS offre des serveurs VPS haute performance pour le trading Forex avec une latence aussi basse que 1ms. Protection Anti-DDoS, uptime 100%, support 24/7.",
    en: "STABLEVPS offers high-performance VPS servers for Forex trading with latency as low as 1ms. Anti-DDoS protection, 100% uptime, 24/7 support."
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.fr,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
    keywords: ["VPS", "Forex", "Trading", "VPS Trading", "Low Latency VPS", "Forex VPS", "MetaTrader VPS", "MT4 VPS", "MT5 VPS"],
    authors: [{ name: "STABLEVPS" }],
    icons: {
      icon: '/logo.png',
      shortcut: '/logo.png',
      apple: '/logo.png',
    },
    openGraph: {
      title: titles[locale as keyof typeof titles] || titles.fr,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
      type: "website",
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      images: ['/logo.png'],
    },
    twitter: {
      card: "summary_large_image",
      title: titles[locale as keyof typeof titles] || titles.fr,
      description: descriptions[locale as keyof typeof descriptions] || descriptions.fr,
      images: ['/logo.png'],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

import { ThemeProvider } from "@/components/ThemeProvider";

// ... existing imports

// ... existing generateMetadata

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Validate locale
  if (!routing.locales.includes(locale as 'fr' | 'en')) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
