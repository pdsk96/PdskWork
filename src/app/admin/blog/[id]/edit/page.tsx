import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getPostById } from '@/lib/blog-store'
import BlogEditor from '@/components/BlogEditor'

export const metadata = { title: 'Edit Post — PdskWork Admin' }

// This dynamic admin route can't produce a static shell (the shared layout
// uses client hooks like usePathname()). Opt out of Cache Components'
// static-shell validation so it renders fully on demand (blocking route).
export const instant = false

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditBlogPostPage({ params }: PageProps) {
  if (!(await isAuthenticated())) {
    const { id } = await params
    redirect(`/admin/login?next=/admin/blog/${id}/edit`)
  }
  const { id } = await params
  const post = await getPostById(id)
  if (!post) {
    redirect('/admin/blog')
  }
  return (
    <main className="auth-shell">
      <BlogEditor post={post} />
    </main>
  )
}
