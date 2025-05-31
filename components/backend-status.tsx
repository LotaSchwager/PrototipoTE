"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, TestTube } from "lucide-react"
import { pingBackend } from "@/lib/backend-client"
import { BACKEND_URL } from "@/config"

export function BackendStatus() {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<string>("")
  const [pingCount, setPingCount] = useState(0)
  const [lastPingStatus, setLastPingStatus] = useState<string>("")
  const [errorDetails, setErrorDetails] = useState<string>("")
  const [testResults, setTestResults] = useState<string>("")

  // Lista estática de modelos (ya que están configurados en el backend)
  const models = [
    { name: "llama3.2", displayName: "Llama 3.2" },
    { name: "gemma3", displayName: "Gemma 3" },
    { name: "qwen2.5", displayName: "Qwen 2.5" },
  ]

  useEffect(() => {
    async function checkBackend() {
      try {
        setLoading(true)
        setErrorDetails("")

        console.log("🔍 Iniciando verificación del backend...")
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
        setErrorDetails(`Error completo: ${err instanceof Error ? err.stack || err.message : String(err)}`)
      } finally {
        setLoading(false)
      }
    }

    checkBackend()

    // Verificar cada 30 segundos
    const interval = setInterval(checkBackend, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleManualCheck = async () => {
    try {
      setLoading(true)
      setErrorDetails("")

      console.log("🔍 Verificación manual del backend...")
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
      setErrorDetails(`Error completo: ${err instanceof Error ? err.stack || err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  // Función para probar el endpoint de ping directamente
  const testPingEndpoint = async () => {
    try {
      setLoading(true)
      setTestResults("Probando endpoint de ping...")

      console.log("🧪 Probando /api/ping...")

      const response = await fetch("/api/ping", {
        cache: "no-store",
      })

      const statusText = `Status: ${response.status} ${response.statusText}`
      console.log("Respuesta del ping:", statusText)

      let responseText = ""
      try {
        responseText = await response.text()
        console.log("Cuerpo de la respuesta:", responseText)
      } catch (e) {
        responseText = `Error al leer respuesta: ${e}`
      }

      setTestResults(`Ping endpoint: ${statusText}\nRespuesta: ${responseText}`)
      setLastChecked(new Date().toLocaleTimeString())
    } catch (err) {
      const errorMsg = `Error al probar ping: ${err instanceof Error ? err.message : String(err)}`
      console.error(errorMsg)
      setTestResults(errorMsg)
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

      {/* Mostrar estado de los modelos basado en la disponibilidad del backend */}
      <div className="mb-4">
        <h4 className="font-medium mb-2 text-sm">Modelos configurados:</h4>
        <div className="space-y-2">
          {models.map((model) => (
            <div key={model.name} className="flex items-center justify-between">
              <span className="text-xs">{model.displayName}</span>
              <Badge variant={isAvailable ? "success" : "destructive"} className="text-xs">
                <span className="flex items-center gap-1">
                  {isAvailable ? (
                    <>
                      <CheckCircle size={10} />
                      Disponible
                    </>
                  ) : (
                    <>
                      <AlertCircle size={10} />
                      No disponible
                    </>
                  )}
                </span>
              </Badge>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mb-4 flex-wrap">
        <button
          onClick={handleManualCheck}
          className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm"
          disabled={loading}
        >
          {loading ? "Verificando..." : "Verificar conexión"}
        </button>

        <button
          onClick={testPingEndpoint}
          className="px-3 py-2 bg-blue-100 hover:bg-blue-200 rounded-md text-sm flex items-center gap-1"
          disabled={loading}
        >
          <TestTube size={14} />
          Test Ping
        </button>
      </div>

      {testResults && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md text-xs font-mono overflow-auto max-h-40">
          <h4 className="font-medium mb-1">Resultados de prueba:</h4>
          <pre>{testResults}</pre>
        </div>
      )}

      {errorDetails && (
        <div className="mt-4 p-3 bg-yellow-50 text-yellow-700 rounded-md text-xs font-mono overflow-auto max-h-40">
          <h4 className="font-medium mb-1">Detalles del error:</h4>
          <pre>{errorDetails}</pre>
        </div>
      )}

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
          <li>Endpoint de ping: /api/ping → {`${BACKEND_URL}/ping`}</li>
          <li>Endpoint de generación: /api/generate → {`${BACKEND_URL}/generate`}</li>
          <li>Endpoint de guardado: /api/save-result → {`${BACKEND_URL}/save-result`}</li>
          <li>Entorno: {process.env.NODE_ENV}</li>
        </ul>
      </div>
    </Card>
  )
}
