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
  const html = marked.parse(md ?? '', { async: false }) as string
  return html
    .replace(SCRIPT_STYLE, '')
    .replace(ON_ATTR, '')
    .replace(ON_ATTR_SINGLE, '')
    .replace(JS_HREF, 'href="#"')
    .replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
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
