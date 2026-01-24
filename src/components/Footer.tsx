"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import logo from '@/assets/logo.png';

export default function Footer() {
  const t = useTranslations('footer');

  const footerLinks = {
    product: [
      { nameKey: 'links.pricing', href: '#pricing' },
      { nameKey: 'links.features', href: '#features' },
      { nameKey: 'links.locations', href: '#locations' },
      { nameKey: 'links.security', href: '#security' },
    ],
    support: [
      { nameKey: 'links.helpCenter', href: '/help' },
      { nameKey: 'links.faq', href: '#faq' },
      { nameKey: 'links.contact', href: '/contact' },
      { nameKey: 'links.status', href: '/status' },
    ],
    company: [
      { nameKey: 'links.about', href: '/about' },
      { nameKey: 'links.blog', href: '/blog' },
      { nameKey: 'links.partners', href: '/partners' },
      { nameKey: 'links.affiliate', href: '/affiliate' },
    ],
    legal: [
      { nameKey: 'links.terms', href: '/terms' },
      { nameKey: 'links.privacy', href: '/privacy' },
      { nameKey: 'links.legalNotice', href: '/legal' },
      { nameKey: 'links.gdpr', href: '/gdpr' },
    ],
  };

  return (
    <footer className="relative pt-20 pb-10 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gray-50 dark:bg-black" />
      <div className="absolute inset-0 grid-pattern opacity-10" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-16">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <Image 
                src={logo} 
                alt="StableVPS Logo" 
                width={64} 
                height={64} 
                className="w-16 h-16"
              />
              <div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">STABLE</span>
                <span className="text-xl font-bold gradient-text">VPS</span>
              </div>
            </Link>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 max-w-xs">
              {t('description')}
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-4">
              <a
                href="https://t.me/stablevps"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-green-500 transition-colors group"
                aria-label="Telegram"
              >
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center group-hover:bg-gray-200 dark:group-hover:bg-gray-800 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                   <path d="M11.944 0A12 12 0 1 0 24 12 12.013 12.013 0 0 0 12 0Zm5.09 8.16-1.37 6.46c-.1.47-.37.58-.75.36l-2.08-1.53-1 .97a.52.52 0 0 1-.41.2l.15-2.08 3.79-3.42c.16-.15-.04-.23-.26-.08l-4.68 2.95-2.02-.63c-.44-.14-.45-.44.09-.65l7.89-3.04c.36-.14.68.09.55.49Z" />
                  </svg>
                </div>
                <span className="font-medium">@stablevps</span>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold mb-4">{t('sections.product')}</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm transition-colors">
                    {t(link.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('sections.support')}</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 text-sm transition-colors">
                    {t(link.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('sections.company')}</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                    {t(link.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">{t('sections.legal')}</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-gray-400 hover:text-green-400 text-sm transition-colors">
                    {t(link.nameKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payment Methods & Certifications */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 py-8 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-gray-500 text-sm">{t('payments')}</span>
            {/* Apple Pay */}
            <div className="px-2 py-1 bg-[#1a1a1a] rounded border border-gray-800 flex items-center justify-center">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="white">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <span className="text-white text-[10px] font-medium tracking-tight ml-1">Pay</span>
            </div>
            {/* Visa */}
            <div className="px-2 py-1 bg-white rounded border border-gray-200 flex items-center justify-center">
              <svg className="h-3 w-auto" viewBox="0 0 750 471" fill="none">
                 <path d="M278.197 334.228l33.36-195.763h53.358l-33.384 195.763H278.197zm246.09-191.54c-10.57-3.966-27.135-8.222-47.82-8.222-52.725 0-89.863 26.55-90.18 64.603-.296 28.13 26.514 43.822 46.752 53.186 20.77 9.596 27.752 15.715 27.654 24.283-.133 13.123-16.586 19.116-31.922 19.116-21.357 0-32.703-2.967-50.225-10.276l-6.878-3.112-7.487 43.823c12.463 5.464 35.51 10.199 59.438 10.445 56.09 0 92.5-26.248 92.916-66.884.199-22.276-14.016-39.216-44.8-53.188-18.65-9.055-30.072-15.099-29.951-24.268 0-8.137 9.668-16.838 30.557-16.838 17.449-.27 30.09 3.535 39.938 7.5l4.781 2.26 7.227-42.428zm137.31-4.223h-41.232c-12.773 0-22.332 3.487-27.941 16.234l-79.244 179.402h56.031s9.16-24.122 11.232-29.418c6.125 0 60.555.084 68.336.084 1.596 6.853 6.49 29.334 6.49 29.334h49.512l-43.184-195.636zm-65.418 126.407c4.414-11.278 21.26-54.723 21.26-54.723-.317.522 4.379-11.334 7.074-18.693l3.605 16.879s10.219 46.729 12.354 56.537h-44.293zM209.17 138.465l-52.24 133.496-5.567-27.13c-9.725-31.273-40.025-65.157-73.898-82.118l47.766 171.203 56.456-.063 84.004-195.388h-56.52z" fill="#1A1F71"/>
                 <path d="M131.92 138.465H45.879l-.682 4.073c66.938 16.205 111.232 55.363 129.618 102.416l-18.71-89.96c-3.23-12.395-12.597-16.094-24.186-16.529z" fill="#F9A533"/>
              </svg>
            </div>
            {/* Mastercard */}
            <div className="px-2 py-1 bg-[#1a1a1a] rounded border border-gray-800 flex items-center justify-center">
              <svg className="h-4 w-auto" viewBox="0 0 131.39 86.9" fill="none">
                <circle cx="43.45" cy="43.45" r="43.45" fill="#EB001B"/>
                <circle cx="87.94" cy="43.45" r="43.45" fill="#F79E1B"/>
                <path d="M65.69 16.68a43.3 43.3 0 0 0-16.4 26.77 43.3 43.3 0 0 0 16.4 26.77 43.3 43.3 0 0 0 16.4-26.77 43.3 43.3 0 0 0-16.4-26.77z" fill="#FF5F00"/>
              </svg>
            </div>
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-sm">
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {t('ssl')}
            </span>
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              {t('rgpdCompliant')}
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-gray-200 dark:border-gray-800">
          <p className="text-gray-500 text-sm">
            {t('copyright', { year: new Date().getFullYear() })}
          </p>
          <p className="text-gray-600 text-xs">
            {t('disclaimer')}
          </p>
        </div>
      </div>
    </footer>
  );
}
