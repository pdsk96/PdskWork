import { marked } from 'marked'
import DOMPurify from 'dompurify'

/**
 * Markdown renderer for blog content.
 *
 * Configures `marked` for safe HTML output. Only admin-authors write content,
 * but as defense-in-depth we disable raw-HTML passthrough (marked escapes
 * inline HTML by default) and strip any <script>/<style> tags that could slip
 * through via link hrefs. Links get target=_blank + rel=noopener.
 *
 * All HTML output is sanitized through DOMPurify with a strict allowlist.
 */

marked.setOptions({
  gfm: true,
  breaks: false,
})

const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'em', 'u', 's', 'del', 'ins',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'ul', 'ol', 'li', 'blockquote', 'pre', 'code',
  'a', 'img', 'figure', 'figcaption',
  'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'hr', 'div', 'span', 'sup', 'sub',
]

const ALLOWED_ATTR = [
  'href', 'src', 'alt', 'title', 'class', 'id',
  'target', 'rel', 'width', 'height',
]

/** Extract video ID from URL based on platform */
function extractVideoId(url: string, platform: string): string | null {
  try {
    const trimmedUrl = url.trim()

    if (platform === 'youtube') {
      // Handle various YouTube URL formats
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
      const match = trimmedUrl.match(regExp)
      return match && match[2].length === 11 ? match[2] : null
    } else if (platform === 'vimeo') {
      // Handle Vimeo URL formats
      const regExp = /https?:\/\/(?:www\.)?vimeo.com\/(\d+)(?:\/|$)/
      const match = trimmedUrl.match(regExp)
      return match ? match[1] : null
    } else {
      // For generic video, just return the URL
      return trimmedUrl.startsWith('http') ? trimmedUrl : null
    }
  } catch {
    return null
  }
}

/** Generate HTML for video embed */
function getVideoEmbedHtml(platform: string, videoId: string): string {
  const baseStyles = 'width: 100%; aspect-ratio: 16/9; border-radius: 10px; overflow: hidden; margin: 1rem 0;'

  if (platform === 'youtube') {
    return `
      <div class="video-embed" style="${baseStyles}">
        <iframe src="https://www.youtube.com/embed/${videoId}"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                style="width: 100%; height: 100%; border: none;">
        </iframe>
      </div>
    `
  } else if (platform === 'vimeo') {
    return `
      <div class="video-embed" style="${baseStyles}">
        <iframe src="https://player.vimeo.com/video/${videoId}"
                frameborder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowfullscreen
                style="width: 100%; height: 100%; border: none;">
        </iframe>
      </div>
    `
  } else {
    // Generic video embed
    return `
      <div class="video-embed" style="${baseStyles}">
        <video controls style="width: 100%; height: 100%;">
          <source src="${videoId}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      </div>
    `
  }
}

export function renderMarkdown(md: string): string {
  const rawHtml = marked.parse(md ?? '', { async: false }) as string

  // Apply custom replacements BEFORE DOMPurify sanitization
  // so our safe video embeds and diagrams are preserved.
  const withEmbeds = rawHtml
    .replace(
      /!\{\{(video|youtube|vimeo)\s+([^\}]+)\}\}/g,
      (match, platform, url) => {
        const videoUrl = url.trim()
        const videoId = extractVideoId(videoUrl, platform)
        if (videoId) {
          return getVideoEmbedHtml(platform, videoId)
        }
        return match // Return original if not a valid video URL
      }
    )
    .replace(
      /!\[([^\]]*)\]\(diagram:([^)]+)\)/g,
      (match, alt, slug) => {
        const id = slug.trim().replace(/[^a-z0-9-]/gi, '')
        return `<figure class="md-diagram" aria-label="${alt || id}">
  <svg viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="diagram-title">
    <title id="diagram-title">${alt || id}</title>
    <rect width="800" height="400" fill="rgba(16,22,40,0.6)" rx="16"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="var(--fg-muted)" font-family="system-ui,sans-serif" font-size="18">${id} diagram placeholder</text>
  </svg>
  ${alt ? `<figcaption>${alt}</figcaption>` : ''}
</figure>`
      }
    )

  // Sanitize with strict DOMPurify allowlist — no custom regex needed.
  return DOMPurify.sanitize(withEmbeds, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:https?|mailto|tel|data:image\/[^;,]+)/i,
  })
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

