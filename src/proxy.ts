import { NextResponse, type NextRequest } from 'next/server'

/**
 * Next.js 16 Proxy (formerly Middleware).
 *
 * Protects /admin routes with an optimistic cookie check. The authoritative
 * verification still happens server-side in route handlers / pages; this only
 * gates routing for UX. Per Next 16 docs, proxy is not a full auth layer.
 */

const SESSION_COOKIE = 'pdsk_admin_session'
const PUBLIC_ADMIN_PATHS = ['/admin/login']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  if (PUBLIC_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }

  const session = request.cookies.get(SESSION_COOKIE)?.value
  if (!session) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
