import { notFound } from 'next/navigation'
import PostEditor from '@/components/admin/PostEditor'
import prisma from '@/lib/prisma'

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

async function getPost(id: string) {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        category: true,
        tags: true,
      },
    })
    return post
  } catch {
    return null
  }
}

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

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const [post, { categories, tags }] = await Promise.all([
    getPost(id),
    getFormData(),
  ])

  if (!post) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">編輯文章</h1>
      <PostEditor
        post={post}
        categories={categories}
        tags={tags}
      />
    </div>
  )
}
