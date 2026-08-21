/** Precio en pesos, sin centavos: un auto no se publica con centavos. */
export function formatearPrecio(valor: string): string {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return valor;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(numero);
}

/**
 * Link de WhatsApp con el mensaje ya escrito.
 *
 * wa.me quiere el numero con codigo de pais y sin nada mas: ni +, ni espacios,
 * ni guiones. Se limpia aca para que el comerciante lo pueda cargar como
 * quiera desde el panel.
 */
export function linkWhatsapp(numero: string, mensaje: string): string {
  const limpio = numero.replace(/\D/g, "");
  return `https://wa.me/${limpio}?text=${encodeURIComponent(mensaje)}`;
}
