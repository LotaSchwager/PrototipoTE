"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle } from "lucide-react"

interface ModelInfo {
  name: string
  displayName: string
  isAvailable: boolean
}

export function ModelStatus() {
  const [models, setModels] = useState<ModelInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchModels() {
      try {
        const response = await fetch("/api/models")
        if (!response.ok) {
          throw new Error("Error al obtener modelos")
        }
        const data = await response.json()
        setModels(data.models)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setLoading(false)
      }
    }

    fetchModels()
  }, [])

  if (loading) {
    return (
      <Card className="p-4">
        <p className="text-center">Cargando modelos...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle size={16} />
          <p>Error: {error}</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="font-medium mb-2">Estado de los modelos</h3>
      <div className="space-y-2">
        {models.map((model) => (
          <div key={model.name} className="flex items-center justify-between">
            <span className="text-sm">{model.displayName}</span>
            <Badge variant={model.isAvailable ? "success" : "destructive"}>
              <span className="flex items-center gap-1">
                {model.isAvailable ? (
                  <>
                    <CheckCircle size={12} />
                    Disponible
                  </>
                ) : (
                  <>
                    <AlertCircle size={12} />
                    No disponible
                  </>
                )}
              </span>
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}