import type { Metadata } from 'next'
import { getSeedPostBySlug, getSeedPublishedPosts } from '@/lib/blog-seed'
import { stripMarkdown } from '@/lib/markdown'
import BlogPostView from '@/components/BlogPostView'

interface PageProps {
  params: Promise<{ slug: string }>
}

// Pre-render the published seed slugs at build so known posts get static HTML
// (SEO + fast first paint). A placeholder `_` is also emitted so Firebase
// Hosting can rewrite unknown slugs (posts created post-deploy) to it; the
// client view then reads the real slug from the URL pathname.
export async function generateStaticParams() {
  const posts = getSeedPublishedPosts()
  return [...posts.map((p) => ({ slug: p.slug })), { slug: '_' }]
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getSeedPostBySlug(slug)
  if (!post) return { title: 'Not found — PdskWork' }
  return {
    title: `${post.title} — PdskWork Blog`,
    description: post.excerpt || stripMarkdown(post.content),
    openGraph: { title: post.title, description: post.excerpt, type: 'article' },
  }
}

export default async function BlogPostPage({}: PageProps) {
  return <BlogPostView />
}

