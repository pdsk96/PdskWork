'use client'

import { useState, useRef, useEffect } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

export default function AgentChat({ messages, onSend, loading }: {
  messages: ChatMessage[]
  onSend: (text: string) => void
  loading?: boolean
}) {
  const { dict } = useLocale()
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    onSend(text)
    setInput('')
  }

  return (
    <div className="agent-chat">
      <div className="agent-chat__messages">
        {messages.length === 0 && (
          <div className="agent-chat__empty">
            <p>Ask the agent to research topics, write articles, or generate images.</p>
            <p className="agent-chat__hint">Try: "Research trending tech topics" or "Write an article about AI agents"</p>
          </div>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`agent-chat__msg agent-chat__msg--${m.role}`}>
            <div className="agent-chat__bubble">{m.content}</div>
            <time className="agent-chat__time">
              {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </time>
          </div>
        ))}
        {loading && (
          <div className="agent-chat__msg agent-chat__msg--assistant">
            <div className="agent-chat__bubble agent-chat__typing">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form className="agent-chat__form" onSubmit={onSubmit}>
        <input
          className="field-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a command..."
          disabled={loading}
        />
        <button type="submit" className="primary-btn" disabled={loading || !input.trim()}>
          Send
        </button>
      </form>
    </div>
  )
}
