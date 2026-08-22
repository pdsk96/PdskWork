'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from '@/i18n/LocaleProvider'

const ADMIN_NAV = [
  { href: '/admin', labelKey: 'adminHome', exact: true },
  { href: '/admin/blog', labelKey: 'blog.adminTitle' },
  { href: '/admin/media', labelKey: 'mediaTitle' },
  { href: '/admin/agents', labelKey: 'agentsTitle' },
]

const AGENT_SUB_NAV = [
  { href: '/admin/agents', labelKey: 'agentsTitle', exact: false },
  { href: '/admin/agents/config', labelKey: 'agentsConfigTitle' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const { dict } = useLocale()

  const safePathname = pathname ?? '/admin'
  const isAgentsSection = safePathname === '/admin/agents' || safePathname.startsWith('/admin/agents/')
  const navItems = isAgentsSection ? AGENT_SUB_NAV : ADMIN_NAV

  const getLabel = (item: typeof ADMIN_NAV[0]): string => {
    if (item.labelKey.includes('.')) {
      const parts = item.labelKey.split('.')
      let value: unknown = dict
      for (const k of parts) {
        if (value && typeof value === 'object' && k in value) {
          value = (value as Record<string, unknown>)[k]
        } else {
          return item.href
        }
      }
      return typeof value === 'string' ? value : item.href
    }
    const raw = (dict as Record<string, unknown>)[item.labelKey]
    return typeof raw === 'string' ? raw : item.href
  }

  return (
    <nav className="admin-nav" aria-label="Admin">
      {navItems.map((item) => {
        const active = item.exact ? safePathname === item.href : safePathname === item.href || safePathname.startsWith(`${item.href}/`)
        const label = getLabel(item)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`admin-nav__link${active ? ' is-active' : ''}`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
