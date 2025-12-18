'use client'

interface MarkdownContentProps {
  content: string
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div
      className="prose prose-lg max-w-none
        prose-headings:font-bold prose-headings:text-gray-900
        prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl
        prose-p:text-gray-700 prose-p:leading-relaxed
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
        prose-strong:text-gray-900
        prose-code:text-pink-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
        prose-pre:bg-gray-900 prose-pre:text-gray-100
        prose-blockquote:border-l-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:py-1
        prose-img:rounded-lg prose-img:shadow-md
        prose-ul:list-disc prose-ol:list-decimal
        prose-li:text-gray-700"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
