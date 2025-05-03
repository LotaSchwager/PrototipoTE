export interface OllamaGenerateParams {
    model: string
    prompt: string
    system?: string
    temperature?: number
    stream?: boolean
  }
  
  export interface OllamaResponse {
    model: string
    created_at: string
    response: string
    done: boolean
  }
  
  export interface ModelInfo {
    name: string
    displayName: string
    isAvailable: boolean
  }
  
  // URL base de la API de Ollama (por defecto es localhost:11434)
  const OLLAMA_API_URL = process.env.NEXT_PUBLIC_OLLAMA_API_URL || "http://localhost:11434"
  
  /**
   * Genera texto usando un modelo de Ollama
   */
  export async function generateWithOllama(params: OllamaGenerateParams): Promise<string> {
    try {
      const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: params.model,
          prompt: params.prompt,
          system: params.system,
          temperature: params.temperature || 0.7,
          stream: params.stream || false,
        }),
      })
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          `Error en la API de Ollama: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`,
        )
      }
  
      const data = (await response.json()) as OllamaResponse
      return data.response
    } catch (error) {
      console.error("Error al generar texto con Ollama:", error)
      return `Error al generar respuesta: ${error instanceof Error ? error.message : "Error desconocido"}`
    }
  }
  
  /**
   * Genera texto usando un modelo de Ollama con streaming
   */
  export async function* streamWithOllama(params: OllamaGenerateParams): AsyncGenerator<string> {
    try {
      const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: params.model,
          prompt: params.prompt,
          system: params.system,
          temperature: params.temperature || 0.7,
          stream: true,
        }),
      })
  
      if (!response.ok) {
        throw new Error(`Error en la API de Ollama: ${response.status} ${response.statusText}`)
      }
  
      if (!response.body) {
        throw new Error("El cuerpo de la respuesta está vacío")
      }
  
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
  
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
  
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split("\n").filter((line) => line.trim() !== "")
  
        for (const line of lines) {
          try {
            const data = JSON.parse(line) as OllamaResponse
            yield data.response
          } catch (e) {
            console.warn("Error al parsear línea JSON:", line)
          }
        }
      }
    } catch (error) {
      console.error("Error al generar texto con streaming de Ollama:", error)
      yield `Error al generar respuesta: ${error instanceof Error ? error.message : "Error desconocido"}`
    }
  }
  
  /**
   * Verifica si un modelo está disponible en Ollama
   */
  export async function checkModelAvailability(modelName: string): Promise<boolean> {
    try {
      const response = await fetch(`${OLLAMA_API_URL}/api/show`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: modelName,
        }),
      })
  
      return response.ok
    } catch (error) {
      console.error(`Error al verificar disponibilidad del modelo ${modelName}:`, error)
      return false
    }
  }
  
  /**
   * Obtiene la lista de modelos configurados para la aplicación
   */
  export async function getAvailableModels(): Promise<ModelInfo[]> {
    const configuredModels = [
      { name: "hf.co/Ainxz/phi3.5-pucv-gguf", displayName: "Phi 3.5 (3.8B)" },
      { name: "hf.co/Ainxz/llama3.2-pucv-gguf", displayName: "Llama 3.2 (1B)" },
      { name: "hf.co/Ainxz/qwen2.5-pucv:latest", displayName: "Qwen 2.5 (0.5B)" },
    ]
  
    const modelsWithAvailability = await Promise.all(
      configuredModels.map(async (model) => ({
        ...model,
        isAvailable: await checkModelAvailability(model.name),
      })),
    )
  
    return modelsWithAvailability
  }