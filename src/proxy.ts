import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export default async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - manifest.json, sw.js
     * - Static asset extensions (.svg, .png, .jpg, .jpeg, .webp, .avif, .ico, .css, .js)
     */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js)$).*)',
  ],
};
