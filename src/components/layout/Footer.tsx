import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">關於</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              分享技術心得、生活點滴與學習筆記的個人部落格。
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">快速連結</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/posts" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  所有文章
                </Link>
              </li>
              <li>
                <Link href="/categories" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  文章分類
                </Link>
              </li>
              <li>
                <Link href="/tags" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  標籤雲
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900 text-sm transition-colors">
                  關於我
                </Link>
              </li>
            </ul>
          </div>

          {/* RSS / Social */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">訂閱</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/feed.xml" className="text-gray-600 hover:text-gray-900 text-sm transition-colors inline-flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19 7.38 20 6.18 20 5 20 4 19 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1Z"/>
                  </svg>
                  RSS Feed
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            &copy; {currentYear} Blog. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
