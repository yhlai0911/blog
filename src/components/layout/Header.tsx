'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, Search } from 'lucide-react'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-gray-900">Blog</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              首頁
            </Link>
            <Link href="/posts" className="text-gray-600 hover:text-gray-900 transition-colors">
              文章
            </Link>
            <Link href="/categories" className="text-gray-600 hover:text-gray-900 transition-colors">
              分類
            </Link>
            <Link href="/tags" className="text-gray-600 hover:text-gray-900 transition-colors">
              標籤
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
              關於
            </Link>
          </div>

          {/* Search & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <Link
              href="/search"
              className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="搜尋"
            >
              <Search className="w-5 h-5" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label="選單"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                首頁
              </Link>
              <Link
                href="/posts"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                文章
              </Link>
              <Link
                href="/categories"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                分類
              </Link>
              <Link
                href="/tags"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                標籤
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-gray-900 transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                關於
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
