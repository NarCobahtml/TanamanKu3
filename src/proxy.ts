import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export default async function proxy(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (err) {
    console.error('[Proxy Error]', err);
    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    /* Kecualikan path aset statis */
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|css|js)$).*)',
  ],
};
