import { NextResponse } from "next/server"
import { BACKEND_URL } from "@/config"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  console.log("🔄 [PING] Solicitud recibida")
  console.log("🔄 [PING] Backend URL:", BACKEND_URL)

  try {
    const targetUrl = `${BACKEND_URL}/ping`
    console.log("🔄 [PING] Conectando a:", targetUrl)

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "NextJS-Client/1.0",
      },
      signal: AbortSignal.timeout(10000), // 10 segundos
    })

    console.log("✅ [PING] Respuesta recibida - Status:", response.status)

    const responseText = await response.text()
    console.log("✅ [PING] Respuesta:", responseText)

    return new NextResponse(responseText, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    })
  } catch (error) {
    console.error("❌ [PING] Error:", error)

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
