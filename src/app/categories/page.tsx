import { Metadata } from 'next'
import Link from 'next/link'
import { Folder } from 'lucide-react'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: '文章分類',
  description: '按分類瀏覽部落格文章',
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { posts: { where: { published: true } } },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
    return categories
  } catch {
    return []
  }
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Folder className="w-8 h-8" />
          文章分類
        </h1>
        <p className="mt-2 text-gray-600">按分類瀏覽文章</p>
      </div>

      {categories.length === 0 ? (
        <p className="text-center text-gray-500 py-12">暫無分類</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow border border-gray-100"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {category.name}
              </h2>
              {category.description && (
                <p className="text-gray-600 text-sm mb-4">
                  {category.description}
                </p>
              )}
              <p className="text-blue-600 font-medium">
                {category._count.posts} 篇文章
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
