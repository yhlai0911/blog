import type { Metadata } from 'next'
import { Inter, Noto_Sans_TC } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { WebsiteJsonLd } from '@/components/seo/JsonLd'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-tc',
})

export const metadata: Metadata = {
  title: {
    default: 'My Blog',
    template: '%s | My Blog',
  },
  description: '分享技術心得、生活點滴與學習筆記的個人部落格',
  keywords: ['blog', '部落格', '技術', '程式設計'],
  authors: [{ name: 'Author' }],
  openGraph: {
    type: 'website',
    locale: 'zh_TW',
    siteName: 'My Blog',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com'

  return (
    <html lang="zh-TW" className={`${inter.variable} ${notoSansTC.variable}`}>
      <body className="min-h-screen bg-gray-50 font-sans antialiased flex flex-col">
        <WebsiteJsonLd
          name="My Blog"
          url={baseUrl}
          description="分享技術心得、生活點滴與學習筆記的個人部落格"
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
