import BlogEditor from '@/components/BlogEditor'
import AdminGate from '@/components/AdminGate'
import AdminNav from '@/components/AdminNav'

interface PageProps {
  params: Promise<{ id: string }>
}

// Static export needs concrete paths. Admin edit ids are runtime-only
// (Firestore), so we emit a single placeholder page (`/admin/blog/_/edit`)
// and Firebase Hosting rewrites `/admin/blog/{id}/edit` → it. BlogEditor
// reads the id from the URL pathname on the client.
export async function generateStaticParams() {
  return [{ id: '_' }]
}

export default async function EditBlogPostPage({}: PageProps) {
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

