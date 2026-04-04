'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, BookOpen, Compass, FolderOpen } from 'lucide-react'
import { C } from '@/lib/tokens'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/lessons', icon: BookOpen, label: 'Lessons' },
  { href: '/explore', icon: Compass, label: 'Explore' },
  { href: '/projects', icon: FolderOpen, label: 'Projects' },
] as const

export function AppNav() {
  const pathname = usePathname()

  return (
    <nav
      className="flex flex-col items-center py-4 gap-1 shrink-0"
      style={{
        width: 64,
        background: C.bg.panel,
        borderRight: `1px solid ${C.border.default}`,
      }}
    >
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center text-[13px] font-black tracking-tight mb-4 shrink-0"
        style={{
          background: C.accent.primary,
          color: '#000',
        }}
      >
        SC
      </div>

      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const isActive = pathname === href || pathname.startsWith(href + '/')
        return (
          <Link
            key={href}
            href={href}
            title={label}
            className="group relative flex flex-col items-center justify-center w-12 h-12 rounded-[10px] transition-all duration-150"
            style={{
              background: isActive ? C.accent.soft : 'transparent',
              color: isActive ? C.accent.primary : C.text.secondary,
            }}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.75} />
            <span className="text-[9px] mt-0.5 font-medium tracking-wide leading-none">{label}</span>
            {isActive && (
              <span
                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                style={{ background: C.accent.primary }}
              />
            )}
          </Link>
        )
      })}
    </nav>
  )
}
