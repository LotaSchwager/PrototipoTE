import { type NextRequest, NextResponse } from "next/server"
import { BACKEND_URL } from "@/config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  console.log("🔄 [SAVE-RESULT] Solicitud POST recibida")
  console.log("🔄 [SAVE-RESULT] Backend URL:", BACKEND_URL)

  try {
    // Obtener el cuerpo de la solicitud
    const body = await request.json()
    console.log("🔄 [SAVE-RESULT] Cuerpo de la solicitud:", body)

    const targetUrl = `${BACKEND_URL}/save-result`
    console.log("🔄 [SAVE-RESULT] Conectando a:", targetUrl)

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "NextJS-Client/1.0",
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(20000), // 20 segundos
    })

    console.log("✅ [SAVE-RESULT] Respuesta recibida - Status:", response.status)

    const responseText = await response.text()
    console.log("✅ [SAVE-RESULT] Respuesta:", responseText)

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("❌ [SAVE-RESULT] Error:", error)

    const errorResponse = {
      error: "Error connecting to backend",
      message: error instanceof Error ? error.message : String(error),
      backend_url: BACKEND_URL,
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(errorResponse, {
      status: 502,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    })
  }
}
