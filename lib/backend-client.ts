import { logger } from "@/utils/logger"

// Nueva estructura de respuesta del modelo con ID
export interface ModelResult {
  model: string
  response?: string
  error?: string
  id?: number
}

// Nueva estructura de respuesta múltiple
export interface MultiResponse {
  status: number
  responses: ModelResult[]
}

// Estructura para enviar el resultado seleccionado
export interface Resultado {
  prompt: string
  respuesta_id_1: number
  respuesta_id_2: number
  respuesta_id_3: number
  respuesta_elegida_id: number
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
    logger.debug("Haciendo ping al backend a través de /api/ping")

    const response = await fetch("/api/ping", {
      method: "GET",
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
      },
    })

    logger.debug("Respuesta de ping:", response.status, response.statusText)

    if (response.ok) {
      try {
        const textResponse = await response.text()
        logger.debug("Respuesta de texto:", textResponse)

        try {
          const jsonData = JSON.parse(textResponse)
          logger.debug("Respuesta JSON:", jsonData)

          if (jsonData && typeof jsonData === "object") {
            if (jsonData.status === 200 && jsonData.content === "pong") {
              logger.debug("Ping exitoso con formato correcto")
              return true
            } else {
              logger.debug("Ping exitoso pero con formato diferente al esperado")
              return true
            }
          }
        } catch (jsonError) {
          logger.debug("La respuesta no es JSON válido, pero el ping fue exitoso")
          return true
        }
      } catch (textError) {
        logger.debug("No se pudo leer el cuerpo de la respuesta, pero el ping fue exitoso")
        return true
      }

      return true
    } else {
      try {
        const errorText = await response.text()
        logger.error("Ping fallido:", response.status, response.statusText, errorText)
      } catch (e) {
        logger.error("Ping fallido:", response.status, response.statusText)
      }
      return false
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Error al verificar disponibilidad del backend:", error.message)
    } else {
      logger.error("Error desconocido al verificar disponibilidad del backend:", error)
    }
    return false
  }
}

/**
 * Genera respuestas para un prompt usando el backend
 */
export async function generateWithBackend(
  prompt: string,
  email: string
): Promise<{ responses: string[]; modelResults: ModelResult[] }> {
  try {
    logger.debug("Generando respuestas para prompt:", prompt)

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt, email }),
    })

    if (!response.ok) {
      let errorMessage = `Error en el backend: ${response.status} ${response.statusText}`

      if (response.status === 502) {
        try {
          const errorData = await response.json()
          errorMessage = `Error de conexión: ${errorData.message || errorData.error}`
        } catch (e) {
          errorMessage = "Error de conexión con el backend"
        }
      }

      throw new Error(errorMessage)
    }

    const data = (await response.json()) as MultiResponse

    // Extraer las respuestas de los modelos
    const responses = data.responses.map((modelResult) => {
      if (modelResult.error) {
        return `Error del modelo ${modelResult.model}: ${modelResult.error}`
      }
      return modelResult.response || `No se recibió respuesta del modelo ${modelResult.model}`
    })

    return {
      responses,
      modelResults: data.responses,
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Error al generar respuestas con el backend:", error.message)
    } else {
      logger.error("Error desconocido al generar respuestas:", error)
    }

    const errorResponses = [
      "Error al comunicarse con el backend. Por favor, verifica que el servidor esté en funcionamiento.",
      "Error al comunicarse con el backend. Por favor, verifica que el servidor esté en funcionamiento.",
      "Error al comunicarse con el backend. Por favor, verifica que el servidor esté en funcionamiento.",
    ]

    const errorModelResults: ModelResult[] = [
      { model: "modelo1", error: "Error de conexión", id: -1 },
      { model: "modelo2", error: "Error de conexión", id: -2 },
      { model: "modelo3", error: "Error de conexión", id: -3 },
    ]

    return {
      responses: errorResponses,
      modelResults: errorModelResults,
    }
  }
}

/**
 * Guarda el resultado seleccionado en el backend
 */
export async function saveResultToBackend(resultado: Resultado): Promise<boolean> {
  try {
    logger.debug("Enviando resultado al backend:", resultado)

    const response = await fetch("/api/save-result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(resultado),
    })

    if (response.ok) {
      logger.debug("Resultado guardado exitosamente")
      return true
    } else {
      let errorMessage = `Error al guardar: ${response.status} ${response.statusText}`

      if (response.status === 502) {
        try {
          const errorData = await response.json()
          errorMessage = `Error de conexión: ${errorData.message || errorData.error}`
        } catch (e) {
          errorMessage = "Error de conexión con el backend"
        }
      }

      logger.error(errorMessage)
      return false
    }
  } catch (error) {
    if (error instanceof Error) {
      logger.error("Error al guardar resultado en el backend:", error.message)
    } else {
      logger.error("Error desconocido al guardar resultado:", error)
    }
    return false
  }
}
