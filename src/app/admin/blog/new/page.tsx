'use client'

import BlogEditor from '@/components/BlogEditor'
import AdminGate from '@/components/AdminGate'
import AdminNav from '@/components/AdminNav'

export default function NewBlogPostPage() {
  return (
    <AdminGate>
      <main className="auth-shell">
        <section className="glass-card admin-console">
          <AdminNav />
          <BlogEditor />
        </section>
      </main>
    </AdminGate>
  )
}

