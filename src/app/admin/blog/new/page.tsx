'use client'

import BlogEditor from '@/components/BlogEditor'
import AdminGate from '@/components/AdminGate'

export default function NewBlogPostPage() {
  return (
    <AdminGate>
      <main className="auth-shell">
        <BlogEditor />
      </main>
    </AdminGate>
  )
}

