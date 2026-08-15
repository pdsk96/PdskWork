import { marked } from 'marked'

/**
 * Markdown renderer for blog content.
 *
 * Configures `marked` for safe HTML output. Only admin-authors write content,
 * but as defense-in-depth we disable raw-HTML passthrough (marked escapes
 * inline HTML by default) and strip any <script>/<style> tags that could slip
 * through via link hrefs. Links get target=_blank + rel=noopener.
 */
marked.setOptions({
  gfm: true,
  breaks: false,
})

const SCRIPT_STYLE = /<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi
const ON_ATTR = /\son\w+\s*=\s*"[^"]*"/gi
const ON_ATTR_SINGLE = /\son\w+\s*=\s*'[^']*'/gi
const JS_HREF = /href\s*=\s*"(?:javascript:)[^"]*"/gi

export function renderMarkdown(md: string): string {
  const html = marked.parse(md ?? '', { async: false }) as string
  return html
    .replace(SCRIPT_STYLE, '')
    .replace(ON_ATTR, '')
    .replace(ON_ATTR_SINGLE, '')
    .replace(JS_HREF, 'href="#"')
    .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
}

/** Plain-text excerpt for meta descriptions / RSS. */
export function stripMarkdown(md: string, max = 160): string {
  const text = (md ?? '')
    .replace(/[#>*_`~\-]/g, ' ')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > max ? `${text.slice(0, max)}…` : text
}
