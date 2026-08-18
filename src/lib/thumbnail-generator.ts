import { BlogPost } from './blog-types'

/**
 * Generate a simple thumbnail URL for a blog post based on its title
 * This creates a gradient-based thumbnail that can be used as a placeholder
 */
export function generateThumbnailUrl(post: BlogPost): string {
  // Use picsum.photos with seed based on post slug for consistent thumbnails
  const width = 400
  const height = 200
  
  return `https://picsum.photos/seed/${post.slug}/${width}/${height}`
}

/**
 * Generate a more sophisticated thumbnail with gradient background
 * This would be replaced with actual image generation in a production environment
 */
export function generateGradientThumbnail(post: BlogPost): string {
  // Use picsum.photos with seed based on post slug for consistent thumbnails
  const width = 800
  const height = 400
  
  return `https://picsum.photos/seed/${post.slug}-gradient/${width}/${height}`
}

/**
 * Get thumbnail URL for a post - uses placeholder service for demo
 * In production, this would generate actual thumbnails
 */
export function getPostThumbnail(post: BlogPost): string {
  // Use picsum.photos with seed based on post slug for consistent thumbnails
  const width = 800
  const height = 400
  
  return `https://picsum.photos/seed/${post.slug}-thumbnail/${width}/${height}`
}