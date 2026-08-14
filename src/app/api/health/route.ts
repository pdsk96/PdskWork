import { NextResponse } from 'next/server'
import { loadSchema } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const schemaLoaded = await loadSchema()
    .then(() => true)
    .catch(() => false)

  return NextResponse.json({
    status: 'ok',
    service: 'PdskWork',
    schemaLoaded,
    time: new Date().toISOString(),
  })
}
