import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Check for maintenance mode
  if (process.env.MAINTENANCE_MODE === 'true') {
    const isMaintenancePath = request.nextUrl.pathname.startsWith('/maintenance');
    const isAdminPath = request.nextUrl.pathname.startsWith('/admin');
    
    // Redirect everyone to /maintenance except if they are trying to reach /admin
    if (!isMaintenancePath && !isAdminPath) {
      return NextResponse.redirect(new URL('/maintenance', request.url));
    }
  }

  // If on maintenance path but maintenance is OFF, redirect to home
  if (process.env.MAINTENANCE_MODE !== 'true' && request.nextUrl.pathname.startsWith('/maintenance')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
