import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — PdskWork',
  description: 'Process notes, deep dives, and iteration retrospectives.',
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
