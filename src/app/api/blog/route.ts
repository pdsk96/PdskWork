import { NextResponse, type NextRequest } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { createPost, getPublishedPosts, type BlogInput } from '@/lib/blog-store'

/**
 * /api/blog
 * - GET  → list published posts (public); ?locale=en|id optional filter.
 * - POST → create a post (admin only).
 */
export async function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('locale')
  const validLocale = locale === 'en' || locale === 'id' ? locale : undefined
  const posts = await getPublishedPosts(validLocale)
  // List endpoint omits full content to keep the payload small.
  return NextResponse.json(
    posts.map((p) => ({
      id: p.id,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      tags: p.tags,
      locale: p.locale,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    })),
  )
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Partial<BlogInput> = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!body.title || !body.title.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }
  if (!body.content) {
    return NextResponse.json({ error: 'Content is required' }, { status: 400 })
  }

  const post = await createPost({
    title: body.title,
    excerpt: body.excerpt ?? '',
    content: body.content,
    tags: body.tags,
    published: body.published,
    locale: body.locale,
    slug: body.slug,
  })
  return NextResponse.json(post, { status: 201 })
}
