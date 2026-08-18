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

export async function uploadMedia(file: File): Promise<MediaItem> {
  const path = `${MEDIA_ROOT}/${Date.now()}_${file.name}`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, file)
  const url = await getDownloadURL(storageRef)
  return { name: file.name, path, fullPath: path, url, size: file.size, contentType: file.type }
}

export async function deleteMedia(path: string): Promise<void> {
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}

export async function listMedia(): Promise<MediaItem[]> {
  const rootRef = ref(storage, MEDIA_ROOT)
  const res = await listAll(rootRef)
  const items: MediaItem[] = []
  for (const item of res.items) {
    const url = await getDownloadURL(item)
    items.push({ name: item.name, path: item.name, fullPath: item.fullPath, url })
  }
  return items
}
