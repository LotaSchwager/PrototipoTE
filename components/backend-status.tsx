"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle } from "lucide-react"
import { pingBackend } from "@/lib/backend-client"
import { BACKEND_URL } from "@/config"

export function BackendStatus() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<string>("")
  const [pingCount, setPingCount] = useState(0)
  const [lastPingStatus, setLastPingStatus] = useState<string>("")

  useEffect(() => {
    async function checkBackend() {
      try {
        setLoading(true)
        const available = await pingBackend()
        setIsAvailable(available)
        setLastChecked(new Date().toLocaleTimeString())
        setPingCount((prev) => prev + 1)
        setLastPingStatus(available ? "Exitoso" : "Fallido")
      } catch (err) {
        setIsAvailable(false)
        setLastChecked(new Date().toLocaleTimeString())
        setPingCount((prev) => prev + 1)
        setLastPingStatus(`Error: ${err instanceof Error ? err.message : "Desconocido"}`)
      } finally {
        setLoading(false)
      }
    }

    checkBackend()

    // Verificar periódicamente el estado del backend
    const interval = setInterval(checkBackend, 10000) // Cada 10 segundos

    return () => clearInterval(interval)
  }, [])

  const handleManualCheck = async () => {
    try {
      setLoading(true)
      const available = await pingBackend()
      setIsAvailable(available)
      setLastChecked(new Date().toLocaleTimeString())
      setPingCount((prev) => prev + 1)
      setLastPingStatus(available ? "Exitoso" : "Fallido")
    } catch (err) {
      setIsAvailable(false)
      setLastChecked(new Date().toLocaleTimeString())
      setPingCount((prev) => prev + 1)
      setLastPingStatus(`Error: ${err instanceof Error ? err.message : "Desconocido"}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading && isAvailable === null) {
    return (
      <Card className="p-4">
        <p className="text-center">Verificando conexión con el backend...</p>
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="font-medium mb-2">Estado del backend</h3>
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm">Servidor de modelos</span>
        <Badge variant={isAvailable ? "success" : "destructive"}>
          <span className="flex items-center gap-1">
            {isAvailable ? (
              <>
                <CheckCircle size={12} />
                Conectado
              </>
            ) : (
              <>
                <AlertCircle size={12} />
                Desconectado
              </>
            )}
          </span>
        </Badge>
      </div>

      <div className="text-xs text-gray-500 mb-4">
        <div>Última verificación: {lastChecked || "No verificado"}</div>
        <div>Número de verificaciones: {pingCount}</div>
        <div>Estado del último ping: {lastPingStatus}</div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleManualCheck}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          disabled={loading}
        >
          {loading ? "Verificando..." : "Verificar conexión"}
        </button>
      </div>

      {!isAvailable && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          <p>No se pudo conectar con el backend. Verifica que el servidor esté en funcionamiento en {BACKEND_URL}</p>
          <p className="mt-2">El backend debe responder a {`${BACKEND_URL}/ping`} con un status HTTP 200</p>
        </div>
      )}

      <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-md text-sm">
        <h4 className="font-medium mb-1">Información de depuración:</h4>
        <ul className="list-disc pl-5">
          <li>URL del backend: {BACKEND_URL}</li>
          <li>Endpoint de ping: {`${BACKEND_URL}/ping`}</li>
          <li>Endpoint de generación: {`${BACKEND_URL}/generate`}</li>
          <li>Endpoint de exportación: {`${BACKEND_URL}/excel`}</li>
        </ul>
      </div>
    </Card>
  )
}

