import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const i18nMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Exclude API routes, static files, etc. form auth check but specific protected paths
  const isProtectedPath = pathname.includes('/dashboard') || pathname.includes('/admin');
  
  if (isProtectedPath) {
    const token = request.cookies.get('auth_token');
    
    if (!token) {
      // Redirect to login preserving the locale if present
      const locale = pathname.split('/')[1];
      const validLocale = ['en', 'fr'].includes(locale) ? locale : 'fr';
      return NextResponse.redirect(new URL(`/${validLocale}/login`, request.url));
    }
  }

  // Chain with next-intl middleware for internationalization
  return i18nMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … if they contain a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
