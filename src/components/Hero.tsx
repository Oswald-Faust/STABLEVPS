"use client";

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('hero');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particles
    const particles: { x: number; y: number; size: number; speedX: number; speedY: number; opacity: number }[] = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      particles.forEach((particle, i) => {
        particles.slice(i + 1).forEach(particle2 => {
          const dx = particle.x - particle2.x;
          const dy = particle.y - particle2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(34, 197, 94, ${0.1 * (1 - distance / 150)})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(particle2.x, particle2.y);
            ctx.stroke();
          }
        });
      });

      // Draw and update particles
      particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${particle.opacity})`;
        ctx.fill();

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1;
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const features = [
    t('features.latency'),
    t('features.support'),
    t('features.compatible'),
    t('features.uptime')
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-28">
      {/* Animated Canvas Background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Gradient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full filter blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-600/15 rounded-full filter blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />

      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-pattern opacity-50" />

      {/* Geometric Shapes */}
      <div className="absolute top-20 right-20 opacity-20">
        <svg width="200" height="200" viewBox="0 0 200 200" className="animate-float" style={{ animationDelay: '-2s' }}>
          <polygon points="100,10 190,150 10,150" fill="none" stroke="#22c55e" strokeWidth="1" />
        </svg>
      </div>
      <div className="absolute bottom-40 left-20 opacity-10">
        <svg width="300" height="300" viewBox="0 0 200 200" className="animate-float" style={{ animationDelay: '-4s' }}>
          <polygon points="100,10 190,150 10,150" fill="none" stroke="#22c55e" strokeWidth="1" />
        </svg>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-green-400 text-sm font-medium">{t('badge')}</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight mb-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            {t('title1')} 
            <span className="gradient-text"> {t('titleHighlight')} </span>
            {t('title2')}<br />
            <span className="gradient-text">{t('titleHighlight2')}</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            {t('subtitle', { latency: '1ms' })}
          </p>

          {/* Features List */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 text-gray-300">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-sm sm:text-base">{feature}</span>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link href="#pricing" className="btn-primary text-lg px-8 py-4">
              {t('cta')}
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link href="#how-it-works" className="btn-secondary text-lg px-8 py-4">
              {t('ctaSecondary')}
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center gap-2 text-gray-400">
              <div className="flex -space-x-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <span className="text-sm font-medium">{t('trust.trustpilot')}</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-700" />
            <div className="text-gray-400 text-sm">
              {t('trust.refund')}
            </div>
            <div className="hidden sm:block w-px h-6 bg-gray-700" />
            <div className="text-gray-400 text-sm">
              {t('trust.uptime')}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
}
