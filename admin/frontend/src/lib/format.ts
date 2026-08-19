const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
});

/** El backend manda el precio como string para no perder precision. */
export function formatPrice(price: string): string {
  const n = Number(price);
  return Number.isNaN(n) ? price : money.format(n);
}
