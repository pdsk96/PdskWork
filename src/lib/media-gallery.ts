'use client'

import { getDownloadURL, ref, uploadBytes, deleteObject, listAll } from 'firebase/storage'
import { storage } from '@/lib/firebase'

export interface MediaItem {
  name: string
  path: string
  fullPath: string
  url: string
  size?: number
  contentType?: string
}

const MEDIA_ROOT = 'media'
const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/ogg',
])

function validateFile(file: File): void {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`)
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}. Allowed: images and videos.`)
  }
}

export async function uploadMedia(file: File): Promise<MediaItem> {
  validateFile(file)
  const path = `${MEDIA_ROOT}/${Date.now()}_${file.name}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  return { name: file.name, path, fullPath: path, url, size: file.size, contentType: file.type }
}

export async function deleteMedia(path: string): Promise<void> {
  if (!path.startsWith(`${MEDIA_ROOT}/`)) {
    throw new Error('Invalid media path')
  }
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}

export async function listMedia(): Promise<MediaItem[]> {
  const rootRef = ref(storage, MEDIA_ROOT)
  const res = await listAll(rootRef)
  const items = await Promise.all(
    res.items.map(async (item) => {
      const url = await getDownloadURL(item)
      return { name: item.name, path: item.name, fullPath: item.fullPath, url }
    })
  )
  return items
}
