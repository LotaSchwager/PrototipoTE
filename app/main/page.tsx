"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { generateResponses } from "@/lib/generate-responses"
import { saveResultToBackend, type ModelResult, type Resultado } from "@/lib/backend-client"
import { PUCVLogo } from "@/components/pucv-logo"
import { SuggestedQuestions } from "@/components/suggested-questions"
import { BackendStatus } from "@/components/backend-status"
import Markdown from 'react-markdown'

interface Message {
  prompt: string
  responses: string[]
  tempSelectedResponse?: number
  selectedResponse?: number
  isConfirmed?: boolean
  // Almacenar los datos completos de los modelos para obtener los IDs
  modelResults?: ModelResult[]
}

export default function ChatbotPage({email}: { email: string }) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversation, setConversation] = useState<Message[]>([])
  const [activeTab, setActiveTab] = useState("chat")
  const [isSaving, setIsSaving] = useState<{ [key: number]: boolean }>({})
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const theme = "light" // Siempre modo claro

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
      // Obtener las respuestas y los datos completos de los modelos del backend
      const result = await generateResponses(prompt,email)

      setConversation([
        ...conversation,
        {
          prompt,
          responses: result.responses,
          tempSelectedResponse: undefined,
          selectedResponse: undefined,
          isConfirmed: false,
          modelResults: result.modelResults, // Guardar los datos completos incluyendo IDs
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
    if (!updatedConversation[messageIndex].isConfirmed) {
      updatedConversation[messageIndex].tempSelectedResponse = responseIndex
      setConversation(updatedConversation)
    }
  }

  const handleConfirmSelection = async (messageIndex: number) => {
    const updatedConversation = [...conversation]
    const message = updatedConversation[messageIndex]

    // Only confirm if there's a temporary selection and not already confirmed
    if (message.tempSelectedResponse !== undefined && !message.isConfirmed && message.modelResults) {
      const selectedIndex = message.tempSelectedResponse

      // Verificar que tenemos los IDs necesarios
      if (
        message.modelResults.length >= 3 &&
        message.modelResults[0].id !== undefined &&
        message.modelResults[1].id !== undefined &&
        message.modelResults[2].id !== undefined &&
        message.modelResults[selectedIndex].id !== undefined
      ) {
        // Preparar los datos para enviar al backend
        const resultado: Resultado = {
          prompt: message.prompt,
          respuesta_id_1: message.modelResults[0].id!,
          respuesta_id_2: message.modelResults[1].id!,
          respuesta_id_3: message.modelResults[2].id!,
          respuesta_elegida_id: message.modelResults[selectedIndex].id!,
        }

        // Indicar que estamos guardando este mensaje específico
        setIsSaving((prev) => ({ ...prev, [messageIndex]: true }))

        try {
          // Enviar al backend
          const success = await saveResultToBackend(resultado)

          if (success) {
            // Update the message with confirmed selection
            message.selectedResponse = selectedIndex
            message.isConfirmed = true
            setConversation(updatedConversation)

            console.log("Resultado guardado exitosamente:", resultado)
          } else {
            alert("Error al guardar la selección. Por favor, intenta de nuevo.")
          }
        } catch (error) {
          console.error("Error al confirmar selección:", error)
          alert("Error al guardar la selección. Por favor, intenta de nuevo.")
        } finally {
          setIsSaving((prev) => ({ ...prev, [messageIndex]: false }))
        }
      } else {
        alert(
          "Error: No se pudieron obtener los IDs de las respuestas. Por favor, intenta generar las respuestas de nuevo.",
        )
        console.error("IDs faltantes en modelResults:", message.modelResults)
      }
    }
  }

  const handleReset = () => {
    setConversation([])
    setPrompt("")
    setIsSaving({})
  }

  const handleUseQuestion = (question: string) => {
    setPrompt(question)
    // No cambiamos automáticamente a la pestaña de chat aquí
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
    <div className={`flex flex-col h-svh ${colors.bg} ${colors.text} overflow-hidden`}>
      {/* Header fijo */}
      <header className="p-2 flex justify-between items-center border-b shrink-0">
        <PUCVLogo />
        <div className="flex items-center gap-4">
          <Button variant="outline" className={`rounded-full ${colors.card} ${colors.text}`} onClick={handleReset}>
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
            <TabsTrigger value="status" className={`${activeTab === "status" ? colors.highlight : ""} ${email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? '' : 'hidden'}`}>
              Estado
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className={`flex-1 overflow-hidden ${activeTab === 'chat' ? 'flex' : 'hidden' } flex-col`}>
            <div ref={chatContainerRef} className="flex-1 flex flex-col space-y-16 overflow-y-auto pr-2">
              {conversation.map((message, messageIndex) => (
                <div key={messageIndex} className="space-y-8">
                  <div className="flex justify-end">
                    <div className="bg-[#4361EE] p-3 rounded-lg max-w-[80%] shadow-sm text-white">{message.prompt}</div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {message.responses.map((response, responseIndex) => (
                      <Card
                        key={responseIndex}
                        className={`p-4 rounded-xl cursor-pointer overflow-hidden shadow-md transition-colors ${
                          message.isConfirmed
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
                          <Markdown>{response}</Markdown>
                          <div className="mt-4 pt-2 border-t text-xs opacity-70">
                            Respuesta {responseIndex + 1}
                            {/* Mostrar el ID si está disponible y en modo debug */}
                            {message.modelResults && message.modelResults[responseIndex]?.id && (
                              <span className="ml-2">(ID: {message.modelResults[responseIndex].id})</span>
                            )}
                          </div>

                          {/* Mostrar información del modelo si está disponible */}
                          {message.modelResults && message.modelResults[responseIndex] && (
                            <div className="mt-2 text-xs opacity-70">
                              <div>Modelo: {message.modelResults[responseIndex].model}</div>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <Button
                      onClick={() => handleConfirmSelection(messageIndex)}
                      disabled={
                        message.tempSelectedResponse === undefined || message.isConfirmed || isSaving[messageIndex]
                      }
                      className={`${
                        message.isConfirmed ? "bg-green-500 hover:bg-green-600" : `${colors.button}`
                      } ${colors.buttonText}`}
                    >
                      {isSaving[messageIndex]
                        ? "Guardando..."
                        : message.isConfirmed
                          ? "Selección Guardada"
                          : "Confirmar Selección"}
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

          <TabsContent value="status" className="flex-1 overflow-y-auto">
            <BackendStatus />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer fijo - Sin botón de exportar */}
      <footer className={`p-2 flex items-center gap-4 ${colors.bg} border-t shrink-0`}>
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

