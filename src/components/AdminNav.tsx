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

export default function AdminNav() {
  const pathname = usePathname()
  const { dict } = useLocale()

  return (
    <nav className="admin-nav" aria-label="Admin">
      {ADMIN_NAV.map((item) => {
        const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`)
        const label = item.labelKey.includes('.')
          ? item.labelKey.split('.').reduce((acc: any, k: string) => acc?.[k], dict as any) || item.href
          : (dict as any)[item.labelKey] || item.href
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
