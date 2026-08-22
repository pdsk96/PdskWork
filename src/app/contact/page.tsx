'use client'

import { useEffect, useRef, useState } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'
import RouteTransition from '@/components/RouteTransition'

export default function ContactPage() {
  const { dict } = useLocale()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    // Initialize EmailJS SDK lazily
    import('@emailjs/browser')
      .then((emailjs) => {
        const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
        if (publicKey) {
          emailjs.init(publicKey)
        }
      })
      .catch(() => {
        // EmailJS not configured — form will still render but submit will warn
      })
  }, [])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(null)
    setSent(false)

    try {
      const emailjs = await import('@emailjs/browser')
      const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
      const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

      if (!serviceId || !templateId || !publicKey) {
        throw new Error('EmailJS is not configured. Set NEXT_PUBLIC_EMAILJS_* environment variables.')
      }

      await emailjs.send(serviceId, templateId, {
        from_name: name,
        reply_to: email,
        message,
      }, publicKey)

      setSent(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message.')
    } finally {
      setSending(false)
    }
  }

  return (
    <RouteTransition>
      <main className="page">
        <section className="glass-card page-card">
          <h1 className="page-title">{dict.nav.contact}</h1>
          <p className="page-lead">{dict.hero.subtitle}</p>
        </section>

        <section className="glass-card page-card">
          <form ref={formRef} className="contact-form" onSubmit={onSubmit}>
            <div className="field">
              <label className="field-label" htmlFor="contact-name">{dict.nav.contact || 'Name'}</label>
              <input
                id="contact-name"
                className="field-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="contact-email">Email</label>
              <input
                id="contact-email"
                className="field-input"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                className="field-input field-input--area"
                rows={6}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell me about your project..."
              />
            </div>

            {error && <p role="alert" className="auth-error">{error}</p>}
            {sent && <p role="status" className="auth-success">Message sent successfully!</p>}

            <button type="submit" className="primary-btn" disabled={sending}>
              {sending ? 'Sending...' : 'Send message'}
            </button>
          </form>
        </section>
      </main>
    </RouteTransition>
  )
}
