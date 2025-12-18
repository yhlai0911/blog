import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '關於我',
  description: '關於這個部落格和作者',
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article className="bg-white rounded-xl shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">關於我</h1>

        <div className="prose prose-lg max-w-none">
          <p>
            歡迎來到我的部落格！這裡是我分享技術心得、生活點滴與學習筆記的地方。
          </p>

          <h2>關於這個部落格</h2>
          <p>
            這個部落格使用現代 Web 技術建立，包括：
          </p>
          <ul>
            <li><strong>Next.js 14</strong> - React 框架，支援 SSR/SSG</li>
            <li><strong>Tailwind CSS</strong> - 實用優先的 CSS 框架</li>
            <li><strong>Prisma</strong> - 現代 ORM</li>
            <li><strong>PostgreSQL</strong> - 關聯式資料庫</li>
          </ul>

          <h2>聯絡方式</h2>
          <p>
            如果你有任何問題或想法，歡迎在文章下方留言，或透過以下方式聯絡我：
          </p>
          <ul>
            <li>Email: your-email@example.com</li>
            <li>GitHub: github.com/your-username</li>
          </ul>

          <h2>訂閱更新</h2>
          <p>
            你可以透過 RSS 訂閱這個部落格，獲取最新文章更新。
          </p>
        </div>
      </article>
    </div>
  )
}
