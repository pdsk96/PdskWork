'use client'

import { useLocale } from '@/i18n/LocaleProvider'
import type { ContentOpportunity } from '@/lib/agents/researcher'
import type { GeneratedPost } from '@/lib/agents/writer'
import DOMPurify from 'dompurify'

export default function ContentReview({ opportunities, selectedOpportunity, onSelectOpportunity, draft, media, onApprove, onReject }: {
  opportunities: ContentOpportunity[] | undefined
  selectedOpportunity: ContentOpportunity | null | undefined
  onSelectOpportunity: (o: ContentOpportunity) => void
  draft: GeneratedPost | null | undefined
  media: { thumbnailUrl: string; inlineImages: string[]; videoUrl?: string } | null | undefined
  onApprove: () => void
  onReject: () => void
}) {
  const { dict } = useLocale()

  if (!opportunities && !draft) return null

  return (
    <div className="content-review">
      {opportunities && !draft && (
        <div className="content-review__step">
          <h3 className="auth-title">Select a Topic</h3>
          <div className="content-review__list">
            {opportunities.map((o, i) => (
              <div
                key={i}
                className={`glass-card content-review__item ${selectedOpportunity === o ? 'is-selected' : ''}`}
                onClick={() => onSelectOpportunity(o)}
              >
                <h4>{o.title}</h4>
                <p className="content-review__angle">{o.angle}</p>
                <div className="content-review__meta">
                  <span className={`blog-badge ${o.confidence === 'high' ? 'blog-badge--published' : 'blog-badge--draft'}`}>
                    {o.confidence}
                  </span>
                  <span className="content-review__keywords">{o.keywords.join(', ')}</span>
                </div>
                <p className="content-review__reason">{o.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {draft && (
        <div className="content-review__step">
          <h3 className="auth-title">Review Draft</h3>
          <div className="glass-card blog-post">
            <div className="blog-post__header">
              <h1 className="blog-post__title">{draft.title}</h1>
              <p className="blog-post__excerpt">{draft.excerpt}</p>
              <div className="blog-card__meta">
                <span>{draft.locale.toUpperCase()}</span>
                <span className="blog-card__dot">·</span>
                <span>{draft.tags.join(', ')}</span>
              </div>
            </div>
            {media && (
              <>
                <div className="blog-post__thumbnail" style={{
                  backgroundImage: `url(${media.thumbnailUrl})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  width: '100%',
                  height: '300px',
                  borderRadius: '10px',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--glass-border)'
                }} />
                {media.videoUrl && (
                  <div className="blog-post__video" style={{ marginBottom: '1.5rem' }}>
                    <video controls width="100%" style={{ borderRadius: '10px', border: '1px solid var(--glass-border)' }}>
                      <source src={media.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </>
            )}
            <div className="blog-post__content markdown-body" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(draft.content) }} />
            <div className="blog-editor__actions">
              <button type="button" className="primary-btn" onClick={onApprove}>Approve & Publish</button>
              <button type="button" className="ghost-btn ghost-btn--danger" onClick={onReject}>Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
