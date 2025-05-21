/**
 * Utilidad para manejar logs condicionales según el entorno
 */

// Determinar si estamos en producción
const isProduction = process.env.NODE_ENV === "production"

// Niveles de log
type LogLevel = "debug" | "info" | "warn" | "error"

// Configuración de nivel de log según el entorno
const LOG_LEVEL: LogLevel = isProduction ? "error" : "debug"

// Mapa para determinar qué niveles se muestran según el nivel configurado
const LEVEL_HIERARCHY: Record<LogLevel, LogLevel[]> = {
  debug: ["debug", "info", "warn", "error"],
  info: ["info", "warn", "error"],
  warn: ["warn", "error"],
  error: ["error"],
}

/**
 * Logger con niveles que respeta el entorno de ejecución
 */
export const logger = {
  debug: (...args: any[]) => {
    if (LEVEL_HIERARCHY[LOG_LEVEL].includes("debug")) {
      console.log("[DEBUG]", ...args)
    }
  },
  info: (...args: any[]) => {
    if (LEVEL_HIERARCHY[LOG_LEVEL].includes("info")) {
      console.info("[INFO]", ...args)
    }
  },
  warn: (...args: any[]) => {
    if (LEVEL_HIERARCHY[LOG_LEVEL].includes("warn")) {
      console.warn("[WARN]", ...args)
    }
  },
  error: (...args: any[]) => {
    // Los errores siempre se muestran
    console.error("[ERROR]", ...args)
  },
}

/**
 * Versión simplificada del logger para uso rápido
 */
export function log(...args: any[]) {
  if (!isProduction) {
    console.log(...args)
  }
}

