'use client'

import { useEffect, useState, useCallback } from 'react'
import { collection, query, where, getDocs, orderBy, limit, doc, setDoc, type Firestore } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { BlogPost } from '@/lib/blog-types'

export interface ReportData {
  id: string
  period: string
  totalViews: number
  topPosts: { title: string; views: number }[]
  topTags: { tag: string; count: number }[]
  generatedAt: number
}

export function useReports() {
  const [reports, setReports] = useState<ReportData[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReports = useCallback(async () => {
    if (!db) return
    try {
      const q = query(collection(db, 'reports'), orderBy('generatedAt', 'desc'), limit(20))
      const snap = await getDocs(q)
      const items: ReportData[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<ReportData, 'id'>) }))
      setReports(items)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return { reports, loading, refetch: fetchReports }
}

export async function generateReport(dbInstance: Firestore, locale?: 'en' | 'id'): Promise<ReportData> {
  const postsSnap = await getDocs(query(collection(dbInstance, 'posts'), where('published', '==', true)))
  const posts = postsSnap.docs.map((d) => d.data() as BlogPost)

  const totalViews = posts.reduce((sum, p) => sum + (p.viewCount || 0), 0)
  const topPosts = [...posts]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5)
    .map((p) => ({ title: p.title, views: p.viewCount || 0 }))

  const tagCount: Record<string, number> = {}
  posts.forEach((p) => (p.tags || []).forEach((t) => { tagCount[t] = (tagCount[t] || 0) + 1 }))
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => ({ tag, count }))

  const now = new Date()
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const report: ReportData = {
    id: `report-${Date.now()}`,
    period,
    totalViews,
    topPosts,
    topTags,
    generatedAt: Date.now(),
  }

  await setDoc(doc(collection(dbInstance, 'reports'), report.id), report)
  return report
}
