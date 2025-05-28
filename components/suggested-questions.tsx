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
    "¿Cuál es la asistencia mínima requerida para los estudiantes de los primeros cuatro semestres?",
    "¿Qué pasa si un estudiante no justifica su inasistencia a una evaluación?",
    "¿Cuál es el plazo máximo para justificar una inasistencia?",
    "¿Cuál es el objetivo de la asignatura Seminario de Título?",
    "¿Cuál es el objetivo de la asignatura Proyecto de Título?",
    "¿Dónde puedo encontrar los formularios de preinscripción correspondiente a las asignaturas Seminario de Título y Proyecto de Título?",
    "¿Quiénes son los profesores guía de seminario y proyecto de título?",
    "¿Cuántas horas debe durar la práctica profesional?",
    "¿Dónde se puede realizar la práctica profesional?",
    "¿Cómo se inscribe una práctica profesional?",
    "¿Qué es la Unidad de Apoyo Estudiantil?",
    "¿Cómo puedo contactar a la Unidad de Apoyo Estudiantil?",
    "¿Cómo se puede acceder a la atención psicoeducativa?",
    "¿Dónde se hace la preinscripción de asignaturas?",
    "¿Cuándo se hace la preinscripción de asignaturas?",
    "¿Cuándo se hace la desinscripción de asignaturas?"
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
