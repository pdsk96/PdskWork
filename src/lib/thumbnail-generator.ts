import { BlogPost } from './blog-types'

/**
 * Generate a simple thumbnail URL for a blog post based on its title
 * This creates a gradient-based thumbnail that can be used as a placeholder
 */
export function generateThumbnailUrl(post: BlogPost): string {
  // Create a simple hash from the title to determine colors
  let hash = 0
  for (let i = 0; i < post.title.length; i++) {
    hash = post.title.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Generate colors based on the hash
  const hue = (hash % 360 + 360) % 360
  const saturation = 70 + (hash % 20)
  const lightness = 50 + (hash % 10)
  
  // Colors for potential future use
  // const primaryColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`
  // const secondaryColor = `hsl(${hue + 30}, ${saturation}%, ${lightness - 10}%)`
  // const tertiaryColor = `hsl(${hue + 60}, ${saturation}%, ${lightness - 20}%)`
  
  // Create a data URL with a simple gradient thumbnail
  const width = 400
  const height = 200
  const titleText = encodeURIComponent(post.title.substring(0, 30) + (post.title.length > 30 ? '...' : ''))
  
  return `https://via.placeholder.com/${width}x${height}/05060a/ffffff?text=${titleText}`
}

/**
 * Generate a more sophisticated thumbnail with gradient background
 * This would be replaced with actual image generation in a production environment
 */
export function generateGradientThumbnail(post: BlogPost): string {
  // Simple hash function for consistent colors
  let hash = 0
  for (let i = 0; i < post.title.length; i++) {
    hash = post.title.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  const hue = (hash % 360 + 360) % 360
  const saturation = 80 + (hash % 15)
  const lightness = 45 + (hash % 15)
  
  // const gradient = `linear-gradient(135deg, 
  //   hsl(${hue}, ${saturation}%, ${lightness}%), 
  //   hsl(${hue + 30}, ${saturation}%, ${lightness - 10}%),
  //   hsl(${hue + 60}, ${saturation}%, ${lightness - 20}%)
  // )`
  
  // For a real implementation, this would generate an actual image
  // For now, we'll use a placeholder service with gradient
  const width = 800
  const height = 400
  const titleText = encodeURIComponent(post.title.substring(0, 20) + (post.title.length > 20 ? '...' : ''))
  
  return `https://via.placeholder.com/${width}x${height}/05060a/ffffff?text=${titleText}`
}

/**
 * Get thumbnail URL for a post - uses placeholder service for demo
 * In production, this would generate actual thumbnails
 */
export function getPostThumbnail(post: BlogPost): string {
  // For now, use a simple placeholder with the post title
  const width = 800
  const height = 400
  const titleText = encodeURIComponent(post.title.substring(0, 25) + (post.title.length > 25 ? '...' : ''))
  
  return `https://via.placeholder.com/${width}x${height}/05060a/ffffff?text=${titleText}`
}