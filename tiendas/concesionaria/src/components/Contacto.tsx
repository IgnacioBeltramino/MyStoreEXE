import type { Perfil } from "@/lib/api";
import { linkWhatsapp } from "@/lib/format";

export function Contacto({ perfil }: { perfil: Perfil | null }) {
  if (!perfil) return null;

  const nombre = perfil.business_name;
  const datos = [
    perfil.phone && { etiqueta: "Telefono", valor: perfil.phone, href: `tel:${perfil.phone.replace(/\s/g, "")}` },
    perfil.address && { etiqueta: "Direccion", valor: perfil.address, href: null },
  ].filter(Boolean) as { etiqueta: string; valor: string; href: string | null }[];

  return (
    <footer id="contacto" className="border-t border-white/[0.06] bg-navy-900">
      <div className="mx-auto max-w-6xl px-6 py-16 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Vení a verlos</h2>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-gray-400">
              Te esperamos para que lo veas en persona y lo pruebes. Tambien tomamos tu usado
              como parte de pago.
            </p>

            {perfil.whatsapp && (
              <a
                href={linkWhatsapp(perfil.whatsapp, `Hola! Los contacto desde la pagina de ${nombre}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-navy-600 px-5 py-3 text-sm font-medium text-white transition-[background-color,transform] duration-150 hover:bg-[#33457a] active:scale-[0.98]"
              >
                Escribinos por WhatsApp
              </a>
            )}
          </div>

          {datos.length > 0 && (
            <dl className="grid content-start gap-5 sm:justify-items-end sm:text-right">
              {datos.map(({ etiqueta, valor, href }) => (
                <div key={etiqueta}>
                  <dt className="text-[11px] uppercase tracking-wide text-gray-500">{etiqueta}</dt>
                  <dd className="mt-1 text-sm text-gray-200">
                    {href ? (
                      <a href={href} className="transition-colors hover:text-white">
                        {valor}
                      </a>
                    ) : (
                      valor
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <p className="mt-14 border-t border-white/[0.06] pt-6 text-xs text-gray-500">
          {nombre} — Los precios pueden variar sin previo aviso. Consultanos por disponibilidad.
        </p>
      </div>
    </footer>
  );
}
