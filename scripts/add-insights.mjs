import fs from 'node:fs'
import path from 'node:path'

const BLOG_JSON = path.join(process.cwd(), 'src/db/blog.json')

const INSIGHT_TEMPLATES = [
  '**Key takeaway:** {title} shows how the ecosystem is shifting toward {keyword}. The practical win here is {benefit}.',
  '**What this means for you:** {title} is not just hype — {detail}. Start small, measure, then adopt.',
  '**Bottom line:** {title} matters because {reason}. In practice, {action}.',
  '**Insight:** {title} reflects a broader trend: {trend}. The teams that move early on this will have a measurable advantage.',
  '**Takeaway:** {title} simplifies {complexity}. If you have been on the fence, {encouragement}.',
]

function pickInsight(post) {
  const text = `${post.title} ${post.excerpt} ${(post.tags || []).join(' ')}`.toLowerCase()
  const keyword = (post.tags && post.tags[0]) || 'this shift'
  const benefit = text.includes('performance') ? 'faster builds and better UX' : text.includes('security') ? 'safer deployment boundaries' : text.includes('cost') ? 'lower infra cost and simpler maintenance' : 'shorter feedback loops'
  const detail = text.includes('next.js') || text.includes('react') ? 'the DX improvements are already measurable in real apps' : text.includes('ai') || text.includes('agent') ? 'the tooling is finally reliable enough to use in production' : text.includes('firebase') || text.includes('hosting') ? 'the setup is much simpler than it looks' : 'the concepts are practical, not theoretical'
  const reason = text.includes('developer') || text.includes('dx') ? 'it directly improves daily developer workflow' : text.includes('user') ? 'it changes what users can reasonably expect from the web' : 'it changes the cost/benefit curve for similar projects'
  const action = text.includes('migration') || text.includes('upgrade') ? 'migrate one module first instead of the whole app' : text.includes('build') || text.includes('tooling') ? 'try it on a small branch before committing' : 'add it to your next iteration plan'
  const trend = text.includes('static') || text.includes('edge') ? 'compute and presentation are separating again' : text.includes('runtime') || text.includes('server') ? 'server usage is becoming more intentional' : 'best practices are stabilizing after years of churn'
  const complexity = text.includes('config') || text.includes('setup') ? 'setup complexity' : text.includes('cache') || text.includes('render') ? 'rendering strategy' : 'what used to require custom architecture'
  const encouragement = text.includes('free') || text.includes('open source') ? 'the tooling is mature enough to use in real projects' : 'the patterns are now well documented'

  const template = INSIGHT_TEMPLATES[Math.floor(Math.random() * INSIGHT_TEMPLATES.length)]
  return template
    .replace('{title}', post.title)
    .replace('{keyword}', keyword)
    .replace('{benefit}', benefit)
    .replace('{detail}', detail)
    .replace('{reason}', reason)
    .replace('{action}', action)
    .replace('{trend}', trend)
    .replace('{complexity}', complexity)
    .replace('{encouragement}', encouragement)
}

function addInsightSection(content, insight) {
  if (!content) return content
  if (content.includes('**Key takeaway:**') || content.includes('**What this means for you:**') || content.includes('**Bottom line:**') || content.includes('**Insight:**') || content.includes('**Takeaway:**')) {
    return content
  }
  const trimmed = content.trimEnd()
  return `${trimmed}\n\n---\n\n${insight}\n`
}

async function main() {
  const raw = await fs.promises.readFile(BLOG_JSON, 'utf8')
  const posts = JSON.parse(raw)

  let updated = 0
  for (const post of posts) {
    if (!post.content) continue
    const insight = pickInsight(post)
    const newContent = addInsightSection(post.content, insight)
    if (newContent !== post.content) {
      post.content = newContent
      updated++
    }
  }

  await fs.promises.writeFile(BLOG_JSON, JSON.stringify(posts, null, 2))
  console.log(`[add-insights] added insight to ${updated} post(s)`)
}

main().catch((err) => {
  console.error('[add-insights] failed:', err)
  process.exit(1)
})
