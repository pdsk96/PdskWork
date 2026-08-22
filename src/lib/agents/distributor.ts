'use client'

import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface DistributionJob {
  id: string
  postId: string
  slug: string
  title: string
  excerpt: string
  locale: 'en' | 'id'
  channels: {
    rss: boolean
    twitter: boolean
    linkedin: boolean
    whatsapp: boolean
  }
  status: 'pending' | 'queued' | 'sent' | 'failed'
  createdAt: number
  updatedAt: number
}

const COLLECTION = 'distributionJobs'

export async function createDistributionJob(
  postId: string,
  slug: string,
  title: string,
  excerpt: string,
  locale: 'en' | 'id',
  channels: DistributionJob['channels'],
): Promise<DistributionJob> {
  if (!db) throw new Error('Firestore not initialized')
  const id = `dist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const now = Date.now()
  const job: DistributionJob = {
    id,
    postId,
    slug,
    title,
    excerpt,
    locale,
    channels,
    status: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  await setDoc(doc(db, COLLECTION, id), job)
  return job
}

export async function updateDistributionJob(id: string, patch: Partial<DistributionJob>): Promise<void> {
  if (!db) return
  await setDoc(doc(db, COLLECTION, id), { ...patch, updatedAt: Date.now() }, { merge: true })
}

export async function getDistributionJob(id: string): Promise<DistributionJob | null> {
  if (!db) return null
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as Omit<DistributionJob, 'id'>) }
}
