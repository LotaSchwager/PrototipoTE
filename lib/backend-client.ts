/**
 * Cliente para interactuar con el backend
 */

import { BACKEND_URL } from "@/config"
import { logger } from "@/utils/logger"

// Actualización de la interfaz para reflejar el nuevo formato de respuesta del modelo
export interface ModelResult {
  model: string
  created_at?: string
  message?: string
  done?: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
  error?: string
}

export interface BackendResponse {
  status: number
  responses: ModelResult[]
}

export interface PingResponse {
  status: number
  content: string
}

/**
 * Verifica si el backend está disponible
 */
export async function pingBackend(): Promise<boolean> {
  try {
    logger.debug("Intentando ping a:", `${BACKEND_URL}/ping`)

    const response = await fetch(`${BACKEND_URL}/ping`, {
      // Evitar caché para obtener siempre el estado actual
      cache: "no-store",
    })

    logger.debug("Respuesta de ping:", response)

    // Si la respuesta es ok (status 200-299), consideramos que el backend está disponible
    // independientemente del formato del cuerpo
    if (response.ok) {
      try {
        // Intentamos parsear el JSON, pero no fallamos si no es posible
        const textResponse = await response.text()
        logger.debug("Respuesta de texto:", textResponse)

        try {
          // Intentar parsear como JSON
          const jsonData = JSON.parse(textResponse)
          logger.debug("Respuesta JSON:", jsonData)

          // Si tiene el formato esperado, verificamos los valores
          if (jsonData && typeof jsonData === "object") {
            if (jsonData.status === 200 && jsonData.content === "pong") {
              logger.debug("Ping exitoso con formato correcto")
            } else {
              logger.debug("Ping exitoso pero con formato diferente al esperado")
            }
          }
        } catch (jsonError) {
          logger.debug("La respuesta no es JSON válido, pero el ping fue exitoso")
        }
      } catch (textError) {
        logger.debug("No se pudo leer el cuerpo de la respuesta, pero el ping fue exitoso")
      }

      // Si la respuesta es ok, consideramos que el backend está disponible
      // independientemente del formato del cuerpo
      return true
    } else {
      logger.error("Ping fallido: respuesta no ok", response.status, response.statusText)
      return false
    }
  } catch (error) {
    logger.error("Error al verificar disponibilidad del backend:", error)
    return false
  }
}

/**
 * Genera respuestas para un prompt usando el backend
 */
export async function generateWithBackend(prompt: string): Promise<string[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    })

    if (!response.ok) {
      throw new Error(`Error en el backend: ${response.status} ${response.statusText}`)
    }

    const data = (await response.json()) as BackendResponse

    // Extraer las respuestas de los modelos
    return data.responses.map((modelResult) => {
      // Si hay un error, devolver el mensaje de error
      if (modelResult.error) {
        return `Error del modelo ${modelResult.model}: ${modelResult.error}`
      }
      // Si no hay error, devolver el contenido del mensaje
      return modelResult.message || `No se recibió respuesta del modelo ${modelResult.model}`
    })
  } catch (error) {
    logger.error("Error al generar respuestas con el backend:", error)
    return [
      "Error al comunicarse con el backend. Por favor, verifica que el servidor esté en funcionamiento.",
      "Error al comunicarse con el backend. Por favor, verifica que el servidor esté en funcionamiento.",
      "Error al comunicarse con el backend. Por favor, verifica que el servidor esté en funcionamiento.",
    ]
  }
}

/**
 * Exporta la conversación al backend
 */
export async function exportToBackend(data: any): Promise<boolean> {
  try {
    const response = await fetch(`${BACKEND_URL}/excel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    return response.ok
  } catch (error) {
    logger.error("Error al exportar datos al backend:", error)
    return false
  }
}

