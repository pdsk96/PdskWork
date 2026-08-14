import { NextResponse, type NextRequest } from 'next/server'
import { clearSessionCookie, createSessionCookie, verifyCredentials } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: { password?: string; next?: string } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const ok = await verifyCredentials(body.password ?? '')
  if (!ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const nextUrl = body.next && body.next.startsWith('/admin') ? body.next : '/admin'
  const headers = new Headers()
  headers.set('Set-Cookie', await createSessionCookie())

  return NextResponse.json({ ok: true, redirect: nextUrl }, { status: 200, headers })
}

export async function DELETE() {
  const headers = new Headers()
  headers.set('Set-Cookie', clearSessionCookie())
  return NextResponse.json({ ok: true }, { status: 200, headers })
}
