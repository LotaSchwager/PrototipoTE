import { NextResponse } from "next/server"
import { BACKEND_URL } from "@/config"

// Definición de la interfaz para el modelo
interface ModelInfo {
  name: string
  displayName: string
  isAvailable: boolean
}

// Función para verificar si el backend está disponible
async function checkBackendAvailability(): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/ping`, {
      cache: "no-store",
    })
    return response.ok
  } catch (error) {
    console.error("Error al verificar disponibilidad del backend:", error)
    return false
  }
}

export async function GET() {
  try {
    // Verificar si el backend está disponible
    const isBackendAvailable = await checkBackendAvailability()

    // Lista de modelos configurados
    const models: ModelInfo[] = [
      { name: "llama3.2", displayName: "Llama 3.2", isAvailable: isBackendAvailable },
      { name: "phi3.5", displayName: "Phi 3.5", isAvailable: isBackendAvailable },
      { name: "qwen2.5", displayName: "Qwen 2.5", isAvailable: isBackendAvailable },
    ]

    return NextResponse.json({ models })
  } catch (error) {
    console.error("Error al obtener modelos:", error)
    return NextResponse.json({ error: "Error al obtener modelos" }, { status: 500 })
  }
}

