"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateResponses, getModelInfo } from "@/lib/generate-responses"
import { exportConversation } from "@/lib/export-conversation"
import { PUCVLogo } from "@/components/pucv-logo"
import { SuggestedQuestions } from "@/components/suggested-questions"
import { ModelStatus } from "@/components/model-status"

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
  },
  modelNames: string[]
}

interface ModelInfo {
  name: string
  displayName: string
  isAvailable: boolean
}

export default function ChatbotPage() {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<Message[]>([])
  const [canExport, setCanExport] = useState(false)
  const [hasExported, setHasExported] = useState(false)
  const [activeTab, setActiveTab] = useState("chat")
  const [models, setModels] = useState<ModelInfo[]>([])
  const chatContainerRef = useRef < HTMLDivElement > (null)
  // const theme = "light" // Siempre modo claro
  // const { theme, setTheme } = useTheme()

  // Cargar información de modelos al iniciar
  useEffect(() => {
    async function loadModelInfo() {
      try {
        const modelInfo = await getModelInfo()
        setModels(modelInfo)
      } catch (error) {
        console.error("Error al cargar información de modelos:", error)
      }
    }

    loadModelInfo()
  }, [])

  // Check if export is possible (5+ complete Q&A)
  useEffect(() => {
    const completedExchanges = conversation.filter((msg) => msg.selectedResponse !== undefined).length
    setCanExport(completedExchanges >= 5)
  }, [conversation])

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [conversation, isLoading])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || isLoading) return

    // Si estamos en la pestaña de preguntas sugeridas, cambiar a la pestaña de chat
    if (activeTab === "questions") {
      setActiveTab("chat")
    }

    setIsLoading(true)
    try {
      const responses = await generateResponses(prompt)

      // Crear objeto de datos de respuesta con información de modelos
      const availableModels = models.filter((model) => model.isAvailable)
      const modelNames =
        availableModels.length >= 3
          ? availableModels.slice(0, 3).map((m) => m.name)
          : [...availableModels.map((m) => m.name), ...Array(3 - availableModels.length).fill("no disponible")]

      setConversation([
        ...conversation,
        {
          prompt,
          responses,
          tempSelectedResponse: undefined,
          selectedResponse: undefined,
          modelNames,
        },
      ])
      setPrompt("")
    } catch (error) {
      console.error("Error generating responses:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTempSelectResponse = (messageIndex: number, responseIndex: number) => {
    const updatedConversation = [...conversation]
    // Only allow selection if not already confirmed
    if (updatedConversation[messageIndex].selectedResponse === undefined) {
      updatedConversation[messageIndex].tempSelectedResponse = responseIndex
      setConversation(updatedConversation)
    }
  }

  const handleConfirmSelection = (messageIndex: number) => {
    const updatedConversation = [...conversation]
    const message = updatedConversation[messageIndex]

    // Only confirm if there's a temporary selection and not already confirmed
    if (message.tempSelectedResponse !== undefined && message.selectedResponse === undefined) {
      const selectedIndex = message.tempSelectedResponse

      // Create the response data structure
      const responseData: { [key: string]: ResponseOption } = {}

      // Usar los nombres de modelos reales si están disponibles
      const modelNames = message.modelNames || ["modelo1", "modelo2", "modelo3"]

      message.responses.forEach((_, index) => {
        responseData[`opcion ${index + 1}`] = {
          modelo: modelNames[index] || `modelo${index + 1}`,
          seleccionado: index === selectedIndex,
        }
      })

      // Update the message with confirmed selection and data
      message.selectedResponse = selectedIndex
      message.responseData = responseData

      setConversation(updatedConversation)

      // Log the response data for debugging
      console.log("Selección confirmada:", responseData)
    }
  }

  const handleExport = async () => {
    if (!canExport) return
    await exportConversation(conversation)
    setHasExported(true)
  }

  const handleReset = () => {
    if (!hasExported) return
    setConversation([])
    setPrompt("")
    setHasExported(false)
  }

  const handleUseQuestion = (question: string) => {
    setPrompt(question)
    // El cambio ocurrirá cuando el usuario presione "Consultar"
  }

  // Simplificar getThemeColors para que solo devuelva colores del modo claro
  const getThemeColors = () => {
    return {
      bg: "bg-[#F8FAFC]",
      card: "bg-white",
      accent: "bg-[#4361EE]",
      text: "text-gray-900",
      highlight: "text-[#4361EE]",
      button: "bg-[#4361EE] hover:bg-[#3A56D4]",
      buttonText: "text-white",
      input: "bg-white border-gray-200",
      selected: "border-green-500",
      notSelected: "border-red-500",
    }
  }

  const colors = getThemeColors()

  return (
    <div className={`flex flex-col h-screen ${colors.bg} ${colors.text} overflow-hidden`}>
      {/* Header fijo */}
      <header className="p-2 flex justify-between items-center border-b shrink-0">
        <PUCVLogo />
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            className={`rounded-full ${colors.card} ${colors.text} ${!hasExported ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={handleReset}
            disabled={!hasExported}
          >
            Reset
          </Button>
        </div>
      </header>

      {/* Contenido principal con scroll solo en el chat */}
      <main className="flex-1 container mx-auto p-2 flex flex-col overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="self-center mb-2 shrink-0">
            <TabsTrigger value="chat" className={activeTab === "chat" ? colors.highlight : ""}>
              Chat
            </TabsTrigger>
            <TabsTrigger value="questions" className={activeTab === "questions" ? colors.highlight : ""}>
              Preguntas Sugeridas
            </TabsTrigger>
            <TabsTrigger value="models" className={activeTab === "models" ? colors.highlight : ""}>
              Modelos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="flex-1 overflow-hidden flex flex-col">
            <div ref={chatContainerRef} className="flex-1 flex flex-col space-y-16 overflow-y-auto pr-2">
              {conversation.map((message, messageIndex) => (
                <div key={messageIndex} className="space-y-8">
                  <div className="flex justify-end">
                    <div
                      className="bg-[#4361EE] p-3 rounded-lg max-w-[80%] shadow-sm text-white"
                    >
                      {message.prompt}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {message.responses.map((response, responseIndex) => (
                      <Card
                        key={responseIndex}
                        className={`p-4 rounded-xl cursor-pointer overflow-hidden shadow-md transition-colors ${
                          message.selectedResponse !== undefined
                            ? message.selectedResponse === responseIndex
                              ? `border-4 ${colors.selected}`
                              : `border-4 ${colors.notSelected} opacity-70`
                            : message.tempSelectedResponse === responseIndex
                              ? `${colors.accent} text-white`
                              : `${colors.card} hover:bg-[#4361EE] hover:text-white`
                        }`}
                        onClick={() => handleTempSelectResponse(messageIndex, responseIndex)}
                      >
                        <div className="h-full overflow-auto">
                          <p>{response}</p>
                          <div className="mt-4 pt-2 border-t text-xs opacity-70">
                            Respuesta {responseIndex + 1}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={() => handleConfirmSelection(messageIndex)}
                      disabled={message.tempSelectedResponse === undefined || message.selectedResponse !== undefined}
                      className={`${
                        message.selectedResponse !== undefined ? "bg-green-500 hover:bg-green-600" : `${colors.button}`
                      } ${colors.buttonText}`}
                    >
                      {message.selectedResponse !== undefined ? "Selección Confirmada" : "Confirmar Selección"}
                    </Button>
                  </div>
                </div>
              ))}

              {conversation.length === 0 && !isLoading && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-500">Ingresa un prompt para comenzar la conversación</p>
                </div>
              )}

              {isLoading && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className={`p-4 h-64 ${colors.accent} rounded-xl relative overflow-hidden`}>
                      <div className="h-full flex items-center justify-center">
                        <p className="text-white">Generando respuesta...</p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="questions" className="flex-1 overflow-y-auto">
            <SuggestedQuestions onSelectQuestion={handleUseQuestion} colors={colors} />
          </TabsContent>

          <TabsContent value="models" className="flex-1 overflow-y-auto">
            <ModelStatus />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer fijo */}
      <footer className={`p-2 flex items-center gap-4 ${colors.bg} border-t shrink-0`}>
        <Button onClick={handleExport} disabled={!canExport} className={`${colors.card} text-black hover:bg-gray-100`}>
          Exportar datos
        </Button>

        <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
          <Input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Presionar para escribir..."
            className={`flex-1 ${colors.input}`}
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className={`${colors.button} ${colors.buttonText}`}
          >
            Consultar
          </Button>
        </form>
      </footer>
    </div>
  )
}
