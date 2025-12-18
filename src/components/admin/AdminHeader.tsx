'use client'

import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { Home, LogOut, User } from 'lucide-react'

interface AdminHeaderProps {
  user: {
    name: string
    email: string
  }
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="bg-white shadow-sm h-16 sticky top-0 z-40">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-xl font-bold text-gray-900">
            Blog Admin
          </Link>
          <Link
            href="/"
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            target="_blank"
          >
            <Home className="w-4 h-4" />
            查看網站
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <User className="w-4 h-4" />
            <span>{user.name}</span>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            登出
          </button>
        </div>
      </div>
    </header>
  )
}
