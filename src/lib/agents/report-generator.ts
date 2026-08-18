'use client'

import { useEffect, useState, useCallback } from 'react'
import { collection, query, where, getDocs, orderBy, limit, doc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

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
      const items: ReportData[] = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))
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

export async function generateReport(db: any, locale?: 'en' | 'id'): Promise<ReportData> {
  const postsSnap = await getDocs(query(collection(db, 'posts'), where('published', '==', true)))
  const posts = postsSnap.docs.map((d: any) => d.data() as any)

  const totalViews = posts.reduce((sum: number, p: any) => sum + (p.viewCount || 0), 0)
  const topPosts = [...posts]
    .sort((a: any, b: any) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5)
    .map((p: any) => ({ title: p.title, views: p.viewCount || 0 }))

  const tagCount: Record<string, number> = {}
  posts.forEach((p: any) => (p.tags || []).forEach((t: string) => { tagCount[t] = (tagCount[t] || 0) + 1 }))
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

  await setDoc(doc(collection(db, 'reports'), report.id), report)
  return report
}
