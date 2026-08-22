'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useLocale } from '@/i18n/LocaleProvider'
import { useViewMode, type ViewMode } from '@/hooks/useViewMode'

interface AdminNavItem {
  href: string
  labelKey: string
  icon?: string
  exact?: boolean
}

const ADMIN_NAV: AdminNavItem[] = [
  { href: '/admin', labelKey: 'home', exact: true },
  { href: '/admin/blog', labelKey: 'blog.adminTitle', icon: '✎' },
  { href: '/admin/media', labelKey: 'mediaTitle', icon: '◫' },
  { href: '/admin/agents', labelKey: 'agentsTitle', icon: '⚙' },
  { href: '/admin/agents/config', labelKey: 'agentsConfigTitle', icon: '◈' },
]

const MOBILE_NAV: AdminNavItem[] = [
  { href: '/admin', labelKey: 'home', icon: '⌂', exact: true },
  { href: '/admin/blog', labelKey: 'blog.adminTitle', icon: '✎' },
  { href: '/admin/media', labelKey: 'mediaTitle', icon: '◫' },
  { href: '/admin/agents', labelKey: 'agentsTitle', icon: '⚙' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const { dict } = useLocale()
  const viewMode = useViewMode()
  const isMobile = viewMode === 'mobile'

  const safePathname = pathname ?? '/admin'
  const navItems = isMobile ? MOBILE_NAV : ADMIN_NAV

  const getLabel = (item: AdminNavItem): string => {
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
    <>
      {/* Desktop horizontal nav */}
      {!isMobile && (
        <nav className="admin-nav" aria-label={dict.ui.adminNav}>
          {navItems.map((item) => {
            const active = item.exact
              ? safePathname === item.href
              : safePathname === item.href || safePathname.startsWith(`${item.href}/`)
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
      )}

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav className="admin-nav__bottom" aria-label={dict.ui.adminNav}>
          {navItems.map((item) => {
            const active = safePathname === item.href || safePathname.startsWith(`${item.href}/`)
            const label = getLabel(item)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav__bottom-item${active ? ' is-active' : ''}`}
              >
                <span className="admin-nav__bottom-icon" aria-hidden="true">{item.icon || '◉'}</span>
                <span className="admin-nav__bottom-label">{label}</span>
              </Link>
            )
          })}
        </nav>
      )}
    </>
  )
}
