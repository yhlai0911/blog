const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export async function GET() {
  const robotsTxt = `# robots.txt for ${SITE_URL}

User-agent: *
Allow: /

# Disallow admin and API routes
Disallow: /admin
Disallow: /admin/*
Disallow: /api/*
Disallow: /login

# Sitemap
Sitemap: ${SITE_URL}/sitemap.xml
`

  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  })
}
