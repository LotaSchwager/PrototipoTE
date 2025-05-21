import { generateWithBackend } from "./backend-client"

/**
 * Genera respuestas para un prompt usando el backend
 */
export async function generateResponses(prompt: string): Promise<string[]> {
  try {
    // Obtener respuestas del backend
    const responses = await generateWithBackend(prompt)
    return responses
  } catch (error) {
    console.error("Error al generar respuestas:", error)
    return [
      "Error al generar respuesta. Por favor intenta de nuevo más tarde.",
      "Error al generar respuesta. Por favor intenta de nuevo más tarde.",
      "Error al generar respuesta. Por favor intenta de nuevo más tarde.",
    ]
  }
}

/**
 * Esta función ya no es necesaria ya que no usamos Ollama directamente
 * Pero la mantenemos para compatibilidad con el código existente
 */
export async function getModelInfo() {
  return []
}

