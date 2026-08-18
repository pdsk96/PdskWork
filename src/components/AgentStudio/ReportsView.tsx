'use client'

import { useLocale } from '@/i18n/LocaleProvider'

export interface ReportData {
  id: string
  period: string
  totalViews: number
  topPosts: { title: string; views: number }[]
  topTags: { tag: string; count: number }[]
  generatedAt: number
}

export default function ReportsView({ reports }: { reports: ReportData[] }) {
  const { dict } = useLocale()

  return (
    <div className="reports-view">
      <h3 className="auth-title">Periodic Reports</h3>
      {reports.length === 0 && <p className="blog-empty">No reports generated yet.</p>}
      <div className="reports-view__list">
        {reports.map((r) => (
          <div key={r.id} className="glass-card reports-view__card">
            <h4>{r.period}</h4>
            <p className="reports-view__metric">Total Views: {r.totalViews}</p>
            <div className="reports-view__section">
              <strong>Top Posts</strong>
              <ul>
                {r.topPosts.map((p, i) => (
                  <li key={i}>{p.title} — {p.views} views</li>
                ))}
              </ul>
            </div>
            <div className="reports-view__section">
              <strong>Top Tags</strong>
              <ul>
                {r.topTags.map((t, i) => (
                  <li key={i}>#{t.tag} ({t.count})</li>
                ))}
              </ul>
            </div>
            <time>{new Date(r.generatedAt).toLocaleString()}</time>
          </div>
        ))}
      </div>
    </div>
  )
}
