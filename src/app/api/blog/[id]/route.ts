import { NextResponse, type NextRequest } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import {
  deletePost,
  getPostById,
  updatePost,
  ReadOnlyDataError,
  type BlogInput,
} from '@/lib/blog-store'

/**
 * /api/blog/[id]
 * - GET    → one post by id (public only if published; admin sees drafts).
 * - PUT    → update a post (admin only).
 * - DELETE → delete a post (admin only).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const post = await getPostById(id)
  if (!post) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  // Drafts are admin-only.
  if (!post.published && !(await isAuthenticated())) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(post)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  let body: Partial<BlogInput> = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
  try {
    const updated = await updatePost(id, body)
    if (!updated) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (err) {
    if (err instanceof ReadOnlyDataError) {
      return NextResponse.json({ error: err.message }, { status: 503 })
    }
    throw err
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const { id } = await params
  try {
    const ok = await deletePost(id)
    if (!ok) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof ReadOnlyDataError) {
      return NextResponse.json({ error: err.message }, { status: 503 })
    }
    throw err
  }
}
