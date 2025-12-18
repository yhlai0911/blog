import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
    },
  })

  console.log(`Created admin user: ${admin.email}`)

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: {
        name: '技術',
        slug: 'technology',
        description: '技術相關文章',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'life' },
      update: {},
      create: {
        name: '生活',
        slug: 'life',
        description: '生活點滴分享',
      },
    }),
    prisma.category.upsert({
      where: { slug: 'thoughts' },
      update: {},
      create: {
        name: '隨想',
        slug: 'thoughts',
        description: '想法與觀點',
      },
    }),
  ])

  console.log(`Created ${categories.length} categories`)

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { slug: 'javascript' },
      update: {},
      create: { name: 'JavaScript', slug: 'javascript' },
    }),
    prisma.tag.upsert({
      where: { slug: 'react' },
      update: {},
      create: { name: 'React', slug: 'react' },
    }),
    prisma.tag.upsert({
      where: { slug: 'nextjs' },
      update: {},
      create: { name: 'Next.js', slug: 'nextjs' },
    }),
    prisma.tag.upsert({
      where: { slug: 'typescript' },
      update: {},
      create: { name: 'TypeScript', slug: 'typescript' },
    }),
    prisma.tag.upsert({
      where: { slug: 'css' },
      update: {},
      create: { name: 'CSS', slug: 'css' },
    }),
    prisma.tag.upsert({
      where: { slug: 'nodejs' },
      update: {},
      create: { name: 'Node.js', slug: 'nodejs' },
    }),
  ])

  console.log(`Created ${tags.length} tags`)

  // Create sample post
  const samplePost = await prisma.post.upsert({
    where: { slug: 'welcome-to-my-blog' },
    update: {},
    create: {
      title: '歡迎來到我的部落格',
      slug: 'welcome-to-my-blog',
      content: `# 歡迎！

這是我的第一篇文章。

## 關於這個部落格

這個部落格是使用以下技術建立的：

- **Next.js 14** - React 框架
- **Tailwind CSS** - 樣式框架
- **Prisma** - ORM
- **PostgreSQL** - 資料庫

## 功能特點

1. 支援 Markdown 和 HTML 格式文章
2. 標籤和分類系統
3. 全站搜尋功能
4. 自建評論系統
5. 後台管理介面
6. 數據分析

歡迎在下方留言！`,
      contentType: 'markdown',
      excerpt: '這是我的第一篇文章，歡迎來到我的部落格！',
      published: true,
      featured: true,
      publishedAt: new Date(),
      categoryId: categories[0].id,
      tags: {
        connect: [{ id: tags[2].id }, { id: tags[3].id }],
      },
    },
  })

  console.log(`Created sample post: ${samplePost.title}`)

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
