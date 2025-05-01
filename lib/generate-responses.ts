import { generateWithOllama, getAvailableModels } from "./ollama-client"

// Mensaje de sistema para todos los modelos
const SYSTEM_PROMPT = "Eres un asistente para una universidad llamada Pontificia Universidad Catolica de Valparaiso"

// Temperatura para la generación
const TEMPERATURE = 0.7

/**
 * Genera respuestas para un prompt usando los modelos configurados
 */
export async function generateResponses(prompt: string): Promise<string[]> {
  try {
    // Obtener modelos disponibles
    const availableModels = await getAvailableModels()

    // Filtrar solo los modelos que están disponibles
    const modelsToUse = availableModels.filter((model) => model.isAvailable)

    // Si no hay modelos disponibles, devolver mensaje de error
    if (modelsToUse.length === 0) {
      return [
        "Error: No hay modelos disponibles. Por favor verifica la conexión con Ollama.",
        "Error: No hay modelos disponibles. Por favor verifica la conexión con Ollama.",
        "Error: No hay modelos disponibles. Por favor verifica la conexión con Ollama.",
      ]
    }

    // Generar respuestas en paralelo
    const responsePromises = modelsToUse.map((model) =>
      generateWithOllama({
        model: model.name,
        prompt,
        system: SYSTEM_PROMPT,
        temperature: TEMPERATURE,
      }),
    )

    // Esperar a que todas las respuestas estén listas
    const responses = await Promise.all(responsePromises)

    // Si hay menos de 3 modelos disponibles, rellenar con mensajes
    while (responses.length < 3) {
      responses.push("Este modelo no está disponible actualmente. Por favor verifica la conexión con Ollama.")
    }

    // Limitar a 3 respuestas en caso de que haya más modelos
    return responses.slice(0, 3)
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
 * Obtiene información sobre los modelos para mostrar en la interfaz
 */
export async function getModelInfo() {
  try {
    const models = await getAvailableModels()
    return models
  } catch (error) {
    console.error("Error al obtener información de modelos:", error)
    return []
  }
}

