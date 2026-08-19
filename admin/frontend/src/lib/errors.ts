import { AxiosError } from "axios";

/** Saca el "detail" que manda FastAPI; si no hay, devuelve el mensaje de reserva. */
export function apiError(error: unknown, fallback = "Algo salio mal. Intenta de nuevo."): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detail;
    // Errores de validacion de Pydantic: [{ loc, msg, ... }]
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
    if (!error.response) return "No se pudo conectar con el servidor.";
  }
  return fallback;
}
