interface ResponseOption {
  modelo: string
  seleccionado: boolean
}

interface Message {
  prompt: string
  responses: string[]
  tempSelectedResponse?: number
  selectedResponse?: number
  responseData?: {
    [key: string]: ResponseOption
  }
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
      })),
    }

    // En un entorno real, aquí se enviaría a un backend
    // Por ahora, simulamos la llamada al backend
    console.log("Enviando datos al backend:", exportData)

    // Simulamos una llamada POST a un backend local
    const response = await fetch("http://localhost:3001/api/save-conversation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(exportData),
    })

    if (!response.ok) {
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
