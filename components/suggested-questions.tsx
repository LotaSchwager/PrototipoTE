"use client"

import { Card } from "@/components/ui/card"

interface SuggestedQuestionsProps {
  onSelectQuestion: (question: string) => void
  colors: {
    card: string
    accent: string
    text: string
    buttonText: string
    [key: string]: string
  }
}

export function SuggestedQuestions({ onSelectQuestion, colors }: SuggestedQuestionsProps) {
  const questions = [
    "¿Cuáles son las principales áreas de investigación de la PUCV?",
    "¿Cómo puedo postular a un programa de postgrado?",
    "¿Qué becas están disponibles para estudiantes internacionales?",
    "¿Cuáles son los requisitos para ingresar a la carrera de Ingeniería?",
    "¿Qué actividades extracurriculares ofrece la universidad?",
    "¿Cómo funciona el proceso de intercambio estudiantil?",
    "¿Cuáles son las fechas importantes del calendario académico?",
    "¿Qué servicios de biblioteca ofrece la universidad?",
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {questions.map((question, index) => (
        <Card
          key={index}
          className={`p-4 ${colors.accent} ${colors.buttonText} hover:opacity-90 cursor-pointer shadow-md`}
          onClick={() => onSelectQuestion(question)}
        >
          <p>{question}</p>
        </Card>
      ))}
    </div>
  )
}
