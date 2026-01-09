"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

export default function Header() {
  const t = useTranslations('header');
  const tPromo = useTranslations('promo');
  const locale = useLocale();
  const router = useRouter();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const switchLocale = (newLocale: 'fr' | 'en') => {
    router.replace('/', { locale: newLocale });
    setIsLangMenuOpen(false);
  };

  const languages = [
    { code: 'fr' as const, name: 'Français', flag: '🇫🇷' },
    { code: 'en' as const, name: 'English', flag: '🇬🇧' },
  ];

  const currentLang = languages.find(l => l.code === locale) || languages[0];

  return (
    <>
      {/* Promo Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-600 via-green-500 to-green-600 py-2 text-center animate-gradient">
        <div className="container mx-auto px-4 flex items-center justify-center gap-4">
          <span className="text-sm font-medium text-white">
            {tPromo('banner', { discount: '-30%' })} <span className="font-bold bg-white/20 px-2 py-0.5 rounded">LAUNCH30</span>
          </span>
          <Link href="#pricing" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-white hover:underline">
            {tPromo('cta')} →
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <header className={`fixed top-10 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/5' 
          : 'bg-transparent'
      }`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-white">STABLE</span>
                <span className="text-xl font-bold gradient-text">VPS</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors font-medium">
                {t('features')}
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors font-medium">
                {t('pricing')}
              </Link>
              <Link href="#locations" className="text-gray-300 hover:text-white transition-colors font-medium">
                {t('locations')}
              </Link>
              <Link href="#security" className="text-gray-300 hover:text-white transition-colors font-medium">
                {t('security')}
              </Link>
              <Link href="#faq" className="text-gray-300 hover:text-white transition-colors font-medium">
                {t('faq')}
              </Link>
            </nav>

            {/* Desktop CTA + Language */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 hover:border-green-500/50 transition-colors"
                >
                  <span className="text-lg">{currentLang.flag}</span>
                  <span className="text-sm text-gray-300">{currentLang.code.toUpperCase()}</span>
                  <svg className={`w-4 h-4 text-gray-400 transition-transform ${isLangMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isLangMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-40 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden z-50">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => switchLocale(lang.code)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-800 transition-colors ${
                          locale === lang.code ? 'bg-green-500/10 text-green-400' : 'text-gray-300'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="text-sm font-medium">{lang.name}</span>
                        {locale === lang.code && (
                          <svg className="w-4 h-4 ml-auto text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/login" className="text-gray-300 hover:text-white transition-colors font-medium">
                {t('login')}
              </Link>
              <Link href="#pricing" className="btn-primary">
                {t('start')}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-black/95 backdrop-blur-xl border-t border-white/5">
            <nav className="container mx-auto px-4 py-6 flex flex-col gap-4">
              <Link href="#features" className="text-gray-300 hover:text-white transition-colors font-medium py-2">
                {t('features')}
              </Link>
              <Link href="#pricing" className="text-gray-300 hover:text-white transition-colors font-medium py-2">
                {t('pricing')}
              </Link>
              <Link href="#locations" className="text-gray-300 hover:text-white transition-colors font-medium py-2">
                {t('locations')}
              </Link>
              <Link href="#security" className="text-gray-300 hover:text-white transition-colors font-medium py-2">
                {t('security')}
              </Link>
              <Link href="#faq" className="text-gray-300 hover:text-white transition-colors font-medium py-2">
                {t('faq')}
              </Link>
              <hr className="border-white/10" />
              
              {/* Mobile Language Switcher */}
              <div className="flex items-center gap-3 py-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => switchLocale(lang.code)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      locale === lang.code 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                        : 'bg-gray-800 text-gray-300 border border-gray-700'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span className="text-sm font-medium">{lang.code.toUpperCase()}</span>
                  </button>
                ))}
              </div>
              
              <Link href="/login" className="text-gray-300 hover:text-white transition-colors font-medium py-2">
                {t('login')}
              </Link>
              <Link href="#pricing" className="btn-primary justify-center mt-2">
                {t('start')}
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
}
