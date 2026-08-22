import fs from 'node:fs'
import path from 'node:path'

const BLOG_JSON = path.join(process.cwd(), 'src/db/blog.json')

function removeInlineImages(content) {
  if (!content) return content
  return content
    .replace(/!\[([^\]]*)\]\(https:\/\/picsum\.photos\/[^)]+\)/g, '')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function main() {
  const raw = fs.readFileSync(BLOG_JSON, 'utf8')
  const posts = JSON.parse(raw)

  let cleaned = 0
  for (const post of posts) {
    if (!post.content) continue
    const original = post.content
    post.content = removeInlineImages(post.content)
    if (post.content !== original) {
      cleaned++
    }
  }

  fs.writeFileSync(BLOG_JSON, JSON.stringify(posts, null, 2))
  console.log(`[clean-blog-images] cleaned ${cleaned} post(s)`)
}

main().catch((err) => {
  console.error('[clean-blog-images] failed:', err)
  process.exit(1)
})
