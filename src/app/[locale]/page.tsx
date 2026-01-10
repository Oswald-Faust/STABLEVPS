import { setRequestLocale } from 'next-intl/server';
import { cookies } from 'next/headers';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import HowItWorks from '@/components/HowItWorks';
import Features from '@/components/Features';
import Pricing from '@/components/Pricing';
import Locations from '@/components/Locations';
import Security from '@/components/Security';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import Footer from '@/components/Footer';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  const isLoggedIn = !!token;

  return (
    <main className="min-h-screen bg-black">
      <Header isLoggedIn={isLoggedIn} />
      <Hero isLoggedIn={isLoggedIn} />
      <HowItWorks />
      <Features />
      <Pricing />
      <Locations />
      <Security />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}
