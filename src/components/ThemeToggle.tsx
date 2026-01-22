"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="relative w-10 h-10 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center"
        title="Changer le thème"
      >
        <div className="w-5 h-5 rounded-full bg-gray-600 animate-pulse" />
      </button>
    )
  }

  const currentTheme = resolvedTheme || theme

  return (
    <button
      onClick={() => setTheme(currentTheme === "light" ? "dark" : "light")}
      className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
      title="Changer le thème"
    >
      {currentTheme === "dark" ? (
        <Moon className="h-5 w-5 text-blue-400" />
      ) : (
        <Sun className="h-5 w-5 text-orange-500" />
      )}
      <span className="sr-only">Changer le thème</span>
    </button>
  )
}
