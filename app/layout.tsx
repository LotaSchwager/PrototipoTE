import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
// Sin importación de ThemeProvider

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Asistente virtual PUCV",
  description: "Chatbot para comparar tres modelos de AI.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}