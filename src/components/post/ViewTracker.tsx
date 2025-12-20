'use client'

import { useEffect } from 'react'

interface ViewTrackerProps {
  slug: string
}

export default function ViewTracker({ slug }: ViewTrackerProps) {
  useEffect(() => {
    // Check if already viewed in this session
    const viewedKey = `viewed_${slug}`
    const hasViewed = sessionStorage.getItem(viewedKey)

    if (hasViewed) {
      return
    }

    // Track the view
    const trackView = async () => {
      try {
        const response = await fetch(`/api/views/${slug}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (data.counted) {
            // Mark as viewed in session storage
            sessionStorage.setItem(viewedKey, 'true')
          }
        }
      } catch (error) {
        // Silently fail - view tracking is not critical
        console.error('View tracking failed:', error)
      }
    }

    // Small delay to ensure this is a real page visit
    const timer = setTimeout(trackView, 1000)

    return () => clearTimeout(timer)
  }, [slug])

  // This component renders nothing
  return null
}
