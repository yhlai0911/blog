import prisma from '@/lib/prisma'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function GET() {
  // Fetch all published posts
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // Fetch all categories
  const categories = await prisma.category.findMany({
    select: {
      slug: true,
    },
  })

  // Fetch all tags
  const tags = await prisma.tag.findMany({
    select: {
      slug: true,
    },
  })

  interface SitemapUrl {
    url: string
    priority: string
    changefreq: string
    lastmod?: string
  }

  const staticPages: SitemapUrl[] = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/posts', priority: '0.9', changefreq: 'daily' },
    { url: '/categories', priority: '0.8', changefreq: 'weekly' },
    { url: '/tags', priority: '0.8', changefreq: 'weekly' },
    { url: '/about', priority: '0.7', changefreq: 'monthly' },
    { url: '/search', priority: '0.6', changefreq: 'weekly' },
  ]

  const postUrls: SitemapUrl[] = posts.map((post) => ({
    url: `/posts/${post.slug}`,
    lastmod: post.updatedAt.toISOString(),
    priority: '0.8',
    changefreq: 'weekly',
  }))

  const categoryUrls: SitemapUrl[] = categories.map((cat) => ({
    url: `/categories/${cat.slug}`,
    priority: '0.7',
    changefreq: 'weekly',
  }))

  const tagUrls: SitemapUrl[] = tags.map((tag) => ({
    url: `/tags/${tag.slug}`,
    priority: '0.6',
    changefreq: 'weekly',
  }))

  const allUrls: SitemapUrl[] = [...staticPages, ...postUrls, ...categoryUrls, ...tagUrls]

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls
  .map(
    (item) => `  <url>
    <loc>${SITE_URL}${item.url}</loc>
    ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ''}
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
