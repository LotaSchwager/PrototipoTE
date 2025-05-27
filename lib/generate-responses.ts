import { generateWithBackend, type ModelResult } from "./backend-client"

/**
 * Genera respuestas para un prompt usando el backend
 * Ahora retorna tanto las respuestas como los datos completos de los modelos (incluyendo IDs)
 */
export async function generateResponses(prompt: string): Promise<{ responses: string[]; modelResults: ModelResult[] }> {
  try {
    // Obtener respuestas y datos de modelos del backend
    const result = await generateWithBackend(prompt)
    return result
  } catch (error) {
    console.error("Error al generar respuestas:", error)

    // En caso de error, devolver respuestas de error
    const errorResponses = [
      "Error al generar respuesta. Por favor intenta de nuevo más tarde.",
      "Error al generar respuesta. Por favor intenta de nuevo más tarde.",
      "Error al generar respuesta. Por favor intenta de nuevo más tarde.",
    ]

    const errorModelResults: ModelResult[] = [
      { model: "modelo1", error: "Error de generación", id: -1 },
      { model: "modelo2", error: "Error de generación", id: -2 },
      { model: "modelo3", error: "Error de generación", id: -3 },
    ]

    return {
      responses: errorResponses,
      modelResults: errorModelResults,
    }
  }
}

/**
 * Esta función ya no es necesaria ya que no usamos Ollama directamente
 * Pero la mantenemos para compatibilidad con el código existente
 */
export async function getModelInfo() {
  return []
}

