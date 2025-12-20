'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()

  const cycleTheme = () => {
    if (theme === 'light') {
      setTheme('dark')
    } else if (theme === 'dark') {
      setTheme('system')
    } else {
      setTheme('light')
    }
  }

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      title={
        theme === 'system'
          ? '跟隨系統'
          : theme === 'dark'
          ? '深色模式'
          : '淺色模式'
      }
    >
      {theme === 'system' ? (
        <Monitor className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      ) : resolvedTheme === 'dark' ? (
        <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      ) : (
        <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      )}
    </button>
  )
}
