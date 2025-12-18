'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  Folder,
  Tag,
  MessageSquare,
  BarChart3,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const menuItems = [
  { href: '/admin', label: '儀表板', icon: LayoutDashboard },
  { href: '/admin/posts', label: '文章管理', icon: FileText },
  { href: '/admin/categories', label: '分類管理', icon: Folder },
  { href: '/admin/tags', label: '標籤管理', icon: Tag },
  { href: '/admin/comments', label: '評論管理', icon: MessageSquare },
  { href: '/admin/analytics', label: '數據分析', icon: BarChart3 },
  { href: '/admin/settings', label: '設定', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-4rem)]">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              )}
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
