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
              {[
                { name: "Twitter", icon: "M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" },
                { name: "Discord", icon: "M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" },
                { name: "Telegram", icon: "M11.944 0A12 12 0 1 0 24 12 12.013 12.013 0 0 0 12 0Zm5.09 8.16-1.37 6.46c-.1.47-.37.58-.75.36l-2.08-1.53-1 .97a.52.52 0 0 1-.41.2l.15-2.08 3.79-3.42c.16-.15-.04-.23-.26-.08l-4.68 2.95-2.02-.63c-.44-.14-.45-.44.09-.65l7.89-3.04c.36-.14.68.09.55.49Z" },
              ].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-900 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-green-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  aria-label={social.name}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                  </svg>
                </a>
              ))}
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
            {/* Visa */}
            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
              <svg className="h-4 w-auto" viewBox="0 0 48 16" fill="none">
                <path d="M17.545 1.031L11.454 14.969H7.545L4.545 4.094c-.182-.711-.341-1.025-.897-1.342-.909-.516-2.409-1-3.647-1.341v-.38H6.773c.909 0 1.727.606 1.909 1.655l1.637 8.689 4.045-10.344h3.181zm12.545 9.313c.014-3.656-5.054-3.858-5.022-5.492.009-.497.485-1.025 1.523-1.161.514-.068 1.933-.12 3.541.625l.631-2.947C29.949.999 28.772.594 27.318.594c-2.999 0-5.109 1.594-5.127 3.874-.018 1.688 1.509 2.63 2.659 3.192 1.182.576 1.577.945 1.572 1.46-.008.789-.941 1.137-1.814 1.15-1.522.023-2.409-.411-3.113-.74l-.549 2.569c.709.325 2.018.608 3.375.622 3.182 0 5.264-1.572 5.269-4.009zm7.91 4.625h2.8L38.318.594h-2.586c-.581 0-1.073.338-1.291.857L30.182 14.969h3.182l.632-1.75h3.886l.368 1.75zm-3.381-4.15l1.595-4.397.918 4.397h-2.513zM15.545.594l-2.5 14.375H10l2.5-14.375h3.045z" fill="#1434CB"/>
              </svg>
            </div>
            {/* Mastercard */}
            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
              <svg className="h-4 w-auto" viewBox="0 0 48 30" fill="none">
                <circle cx="18" cy="15" r="12" fill="#EB001B"/>
                <circle cx="30" cy="15" r="12" fill="#F79E1B"/>
                <path d="M24 22.5c2.5-2.1 4.1-5.3 4.1-8.85s-1.6-6.75-4.1-8.85c-2.5 2.1-4.1 5.3-4.1 8.85s1.6 6.75 4.1 8.85z" fill="#FF5F00"/>
              </svg>
            </div>
            {/* PayPal */}
            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
              <svg className="h-4 w-auto" viewBox="0 0 24 24" fill="none">
                <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106z" fill="#003087"/>
                <path d="M23.048 6.737c-.02.132-.043.267-.07.407-1.003 5.156-4.436 6.935-8.823 6.935h-2.236a1.091 1.091 0 00-1.078.922l-1.38 8.75c-.055.348.212.66.565.66h3.966c.46 0 .852-.337.924-.79l.039-.2.732-4.642.047-.257a.93.93 0 01.919-.79h.578c3.75 0 6.686-1.524 7.545-5.933.36-1.842.174-3.38-.778-4.461a3.726 3.726 0 00-1.95-1.001z" fill="#0070E0"/>
              </svg>
            </div>
            {/* Bitcoin */}
            <div className="px-2 py-1 bg-gray-100 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-800">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path d="M23.638 14.904c-1.602 6.43-8.113 10.34-14.542 8.736C2.67 22.05-1.244 15.525.362 9.105 1.962 2.67 8.475-1.243 14.9.358c6.43 1.605 10.342 8.115 8.738 14.546z" fill="#F7931A"/>
                <path d="M17.063 10.32c.24-1.603-.978-2.466-2.644-3.040l.54-2.168-1.318-.33-.526 2.11c-.347-.086-.702-.168-1.056-.248l.53-2.124-1.317-.33-.54 2.167c-.287-.065-.568-.13-.84-.198l.001-.006-1.816-.454-.35 1.407s.978.224.958.238c.534.133.63.487.614.767l-.615 2.469c.037.01.084.023.137.045l-.14-.035-.862 3.454c-.065.162-.23.405-.602.313.013.02-.959-.24-.959-.24l-.655 1.508 1.714.427c.319.08.631.163.94.242l-.546 2.19 1.316.329.54-2.17c.36.098.709.188 1.05.273l-.538 2.156 1.318.33.546-2.183c2.249.426 3.94.254 4.652-1.78.574-1.637-.029-2.58-1.21-3.196.86-.198 1.509-.764 1.681-1.934zm-3.008 4.217c-.408 1.636-3.164.752-4.058.53l.724-2.9c.894.223 3.76.665 3.334 2.37zm.408-4.24c-.372 1.49-2.665.733-3.41.547l.656-2.631c.745.186 3.142.533 2.754 2.083z" fill="#fff"/>
              </svg>
            </div>
            {/* Ethereum */}
            <div className="px-2 py-1 bg-gray-900 rounded border border-gray-800">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none">
                <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.37 4.35h.001zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z" fill="#627EEA"/>
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
