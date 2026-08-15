import Link from 'next/link'
import { redirect } from 'next/navigation'
import { isAuthenticated } from '@/lib/auth'
import { getLocaleDict } from '@/i18n/locale-server'
import { getAllPosts } from '@/lib/blog-store'
import { formatDate } from '@/lib/blog-utils'

export const metadata = { title: 'Blog Management — PdskWork Admin' }

export default async function AdminBlogPage() {
  if (!(await isAuthenticated())) {
    redirect('/admin/login?next=/admin/blog')
  }
  const { locale, dict } = await getLocaleDict()
  const posts = await getAllPosts()

  return (
    <main className="auth-shell">
      <section className="glass-card admin-console">
        <div className="blog-admin__head">
          <div>
            <h1 className="auth-title">{dict.blog.adminTitle}</h1>
            <p className="admin-welcome">{dict.blog.adminSubtitle}</p>
          </div>
          <Link href="/admin/blog/new" className="primary-btn">{dict.blog.newPost}</Link>
        </div>

        <Link href="/blog" className="ghost-btn" target="_blank">
          {dict.blog.viewPosts} ↗
        </Link>

        {posts.length === 0 ? (
          <p className="blog-empty">{dict.blog.noPosts}</p>
        ) : (
          <ul className="blog-admin__list">
            {posts.map((post) => (
              <li key={post.id} className="blog-admin__item">
                <div className="blog-admin__item-main">
                  <span
                    className={`blog-badge ${post.published ? 'blog-badge--published' : 'blog-badge--draft'}`}
                  >
                    {post.published ? dict.blog.publishedBadge : dict.blog.draftBadge}
                  </span>
                  <span className="blog-admin__item-locale">{post.locale.toUpperCase()}</span>
                  <span className="blog-admin__item-title">{post.title}</span>
                  <time className="blog-admin__item-date" dateTime={post.createdAt}>
                    {formatDate(post.createdAt, locale)}
                  </time>
                </div>
                <div className="blog-admin__item-actions">
                  <Link href={`/admin/blog/${post.id}/edit`} className="ghost-btn">
                    {dict.blog.edit}
                  </Link>
                  {post.published && (
                    <Link href={`/blog/${post.slug}`} className="ghost-btn" target="_blank">
                      ↗
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}

        <Link href="/admin" className="ghost-btn">← {dict.blog.backToAdmin}</Link>
      </section>
    </main>
  )
}
