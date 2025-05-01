"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

export function useTheme() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme } = React.useContext(
    React.createContext({
      theme: "light",
      setTheme: (theme: string) => {},
    }),
  )

  React.useEffect(() => {
    setMounted(true)
  }, [])

  return {
    theme: mounted ? theme : "light",
    setTheme,
  }
}
