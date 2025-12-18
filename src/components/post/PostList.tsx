import PostCard from './PostCard'
import type { Post, Tag, Category } from '@/types'

interface PostListProps {
  posts: (Post & {
    category?: Category | null
    tags?: Tag[]
  })[]
  emptyMessage?: string
}

export default function PostList({ posts, emptyMessage = '暫無文章' }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
