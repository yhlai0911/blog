import PostEditor from '@/components/admin/PostEditor'
import prisma from '@/lib/prisma'

async function getFormData() {
  try {
    const [categories, tags] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      prisma.tag.findMany({ orderBy: { name: 'asc' } }),
    ])
    return { categories, tags }
  } catch {
    return { categories: [], tags: [] }
  }
}

export default async function NewPostPage() {
  const { categories, tags } = await getFormData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">新增文章</h1>
      <PostEditor categories={categories} tags={tags} />
    </div>
  )
}
