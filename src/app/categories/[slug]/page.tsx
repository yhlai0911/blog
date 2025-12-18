import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import PostList from '@/components/post/PostList'
import prisma from '@/lib/prisma'

interface CategoryPageProps {
  params: Promise<{
    slug: string
  }>
}

async function getCategory(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        posts: {
          where: {
            published: true,
          },
          include: {
            category: true,
            tags: true,
          },
          orderBy: {
            publishedAt: 'desc',
          },
        },
        _count: {
          select: { posts: { where: { published: true } } },
        },
      },
    })
    return category
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    return {
      title: '分類不存在',
    }
  }

  return {
    title: category.name,
    description: category.description || `${category.name} 分類下的所有文章`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const category = await getCategory(slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1 text-gray-600 hover:text-gray-900 mb-8 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        返回分類列表
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="mt-2 text-gray-600">{category.description}</p>
        )}
        <p className="mt-2 text-gray-500">共 {category._count.posts} 篇文章</p>
      </div>

      <PostList posts={category.posts} emptyMessage="此分類暫無文章" />
    </div>
  )
}
