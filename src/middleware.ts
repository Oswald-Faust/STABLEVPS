import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { routing } from './i18n/routing';

const i18nMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Admin login page should be accessible to everyone (no auth required)
  const isAdminLoginPage = pathname.includes('/admin/login');
  if (isAdminLoginPage) {
    return i18nMiddleware(request);
  }
  
  // Exclude API routes, static files, etc. from auth check but specific protected paths
  const isAdminPath = pathname.includes('/admin');
  const isDashboardPath = pathname.includes('/dashboard');
  
  if (isAdminPath || isDashboardPath) {
    const token = request.cookies.get('auth_token');
    
    if (!token) {
      // Redirect to appropriate login preserving the locale if present
      const locale = pathname.split('/')[1];
      const validLocale = ['en', 'fr'].includes(locale) ? locale : 'fr';
      
      // Admin routes redirect to admin login, dashboard to user login
      const loginPath = isAdminPath ? `/${validLocale}/admin/login` : `/${validLocale}/login`;
      return NextResponse.redirect(new URL(loginPath, request.url));
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
