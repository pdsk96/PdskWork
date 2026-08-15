import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import BlogEditor from '@/components/BlogEditor'

export const metadata = { title: 'New Post — PdskWork Admin' }

export default async function NewBlogPostPage() {
  if (!(await isAuthenticated())) {
    redirect('/admin/login?next=/admin/blog/new')
  }
  return (
    <main className="auth-shell">
      <BlogEditor />
    </main>
  )
}
