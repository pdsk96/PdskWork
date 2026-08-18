'use client'

import { useEffect, useRef, useState } from 'react'
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { createPost } from '@/lib/blog-firestore'

export interface ScheduledJob {
  id: string
  title: string
  content: string
  excerpt: string
  tags: string[]
  locale: 'en' | 'id'
  scheduledAt: number
  status: 'pending' | 'published' | 'failed'
  createdAt: number
}

export function useScheduler(intervalMs = 300000) {
  const [jobs, setJobs] = useState<ScheduledJob[]>([])
  const [running, setRunning] = useState(false)
  const [lastRun, setLastRun] = useState<number | null>(null)
  const unsubRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (!db) return
    const q = query(collection(db, 'scheduledJobs'), where('status', '==', 'pending'))
    const unsub = onSnapshot(q, (snap) => {
      const items: ScheduledJob[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
      setJobs(items)
    })
    unsubRef.current = unsub
    return () => unsub()
  }, [])

  useEffect(() => {
    if (!db || jobs.length === 0 || running) return
    const now = Date.now()
    const due = jobs.filter((j) => j.scheduledAt <= now)
    if (due.length === 0) return

    setRunning(true)
    setLastRun(now)
    ;(async () => {
      for (const job of due) {
        try {
          await createPost({
            title: job.title,
            slug: job.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
            excerpt: job.excerpt,
            content: job.content,
            tags: job.tags,
            published: true,
            locale: job.locale,
          })
          await updateDoc(doc(db, 'scheduledJobs', job.id), { status: 'published', publishedAt: serverTimestamp() })
        } catch {
          await updateDoc(doc(db, 'scheduledJobs', job.id), { status: 'failed' })
        }
      }
      setRunning(false)
    })()
  }, [jobs, running])

  useEffect(() => {
    if (intervalMs <= 0) return
    const id = setInterval(() => {
      setLastRun(Date.now())
    }, intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])

  return { jobs, running, lastRun }
}
