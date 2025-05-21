import { exportToBackend } from "./backend-client"

interface ResponseOption {
  modelo: string
  seleccionado: boolean
  // Campos adicionales para métricas
  created_at?: string
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  prompt_eval_duration?: number
  eval_count?: number
  eval_duration?: number
}

interface Message {
  prompt: string
  responses: string[]
  tempSelectedResponse?: number
  selectedResponse?: number
  responseData?: {
    [key: string]: ResponseOption
  }
  // Almacenar los datos completos de los modelos para exportación
  modelResults?: any[]
}

export async function exportConversation(conversation: Message[]): Promise<void> {
  try {
    // Filtrar solo las conversaciones completas (con respuesta seleccionada)
    const completedConversation = conversation.filter((msg) => msg.selectedResponse !== undefined)

    // Formatear los datos para exportar
    const exportData = {
      timestamp: new Date().toISOString(),
      exchanges: completedConversation.map((msg) => ({
        prompt: msg.prompt,
        selectedResponseIndex: msg.selectedResponse,
        selectedResponseContent: msg.responses[msg.selectedResponse as number],
        responseData: msg.responseData,
        // Incluir los datos completos de los modelos si están disponibles
        modelResults: msg.modelResults || [],
      })),
    }

    // Enviar datos al backend
    console.log("Enviando datos al backend:", exportData)
    const success = await exportToBackend(exportData)

    if (!success) {
      throw new Error("Error al exportar la conversación")
    }

    // También ofrecemos la descarga del archivo JSON
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `conversation-export-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    alert("Conversación exportada correctamente")
  } catch (error) {
    console.error("Error al exportar la conversación:", error)
    alert("Error al exportar la conversación")
  }
}
