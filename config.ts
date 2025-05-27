// Configuración global de la aplicación

// Determinar el entorno
const isDevelopment = process.env.NODE_ENV === "development"
const isProduction = process.env.NODE_ENV === "production"


// URL base del backend
<<<<<<< HEAD
// En desarrollo: localhost
// En producción: VM de Google Cloud
export const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || (isDevelopment ? "http://localhost:8080" : "http://35.225.42.158:8080")

// Información de depuración
export const DEBUG = {
  // Mostrar información de depuración en la consola
  ENABLED: isDevelopment || process.env.NEXT_PUBLIC_DEBUG === "true",

  // Información sobre el entorno
  ENVIRONMENT: process.env.NODE_ENV || "development",
  IS_DEVELOPMENT: isDevelopment,
  IS_PRODUCTION: isProduction,

  // Información de la aplicación
  VERSION: "1.0.0",
  BACKEND_URL,
}

// Log de configuración para debug
if (DEBUG.ENABLED) {
  console.log("[CONFIG] Configuración cargada:", {
    environment: DEBUG.ENVIRONMENT,
    backendUrl: BACKEND_URL,
    isDevelopment,
    isProduction,
  })
}
=======
export const BACKEND_URL = "http://104.197.91.136:8080"
>>>>>>> cf0ce7f7620029a76a2d95f2ccfa8cbbef02b7a5
