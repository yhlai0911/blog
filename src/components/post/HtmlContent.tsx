'use client'

interface HtmlContentProps {
  content: string
}

export default function HtmlContent({ content }: HtmlContentProps) {
  // For HTML content, we render it in an iframe to preserve original styles
  // Or directly inject if you trust the content
  return (
    <div
      className="html-content"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
