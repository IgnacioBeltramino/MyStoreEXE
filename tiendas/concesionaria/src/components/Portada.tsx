import type { Perfil } from "@/lib/api";
import { linkWhatsapp } from "@/lib/format";

/**
 * Portada. El fondo es CSS y SVG, sin imagenes: la concesionaria no tiene que
 * conseguir una foto de portada para que la pagina se vea bien, y pesa nada.
 */
export function Portada({ perfil, cantidad }: { perfil: Perfil | null; cantidad: number }) {
  const nombre = perfil?.business_name ?? "Nuestra concesionaria";

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(165deg,#060a14_0%,#0b1730_32%,#17347d_66%,#2f66d6_92%,#3f7bec_100%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 600"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {[
          [140, 92, 1.6, 0.45], [340, 58, 1.1, 0.3], [560, 132, 1.3, 0.35],
          [820, 74, 1.1, 0.28], [1010, 176, 1.5, 0.4], [250, 218, 1.1, 0.26],
          [700, 250, 1.2, 0.3], [430, 310, 1, 0.22], [960, 330, 1.3, 0.26],
        ].map(([cx, cy, r, o], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#ffffff" opacity={o} />
        ))}
      </svg>

      <svg
        className="absolute inset-x-0 bottom-0 h-[30%] w-full"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 130 C240 92 420 168 660 138 C880 110 1020 154 1200 120 L1200 200 L0 200 Z"
          fill="#0a142c"
          opacity="0.7"
        />
        <path
          d="M0 158 C280 124 470 188 710 158 C930 130 1060 172 1200 146 L1200 200 L0 200 Z"
          fill="#070b16"
        />
      </svg>

      {/* Velo con tinte azul, no negro: si se oscurece de mas se pierde el azul
          que le da caracter. */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(to_top,rgba(5,10,26,0.6)_0%,rgba(5,10,26,0.26)_45%,transparent_100%)]" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="max-w-2xl">
          <p className="surgir text-xs font-medium uppercase tracking-[0.16em] text-blue-200/80">
            {cantidad > 0
              ? `${cantidad} ${cantidad === 1 ? "unidad disponible" : "unidades disponibles"}`
              : "Concesionaria"}
          </p>

          <h1
            className="surgir mt-3 text-4xl font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl"
            style={{ animationDelay: "60ms" }}
          >
            {nombre}
          </h1>

          {perfil?.description && (
            <p
              className="surgir mt-5 max-w-xl text-base leading-relaxed text-blue-50/85"
              style={{ animationDelay: "120ms" }}
            >
              {perfil.description}
            </p>
          )}

          <div
            className="surgir mt-9 flex flex-wrap gap-3"
            style={{ animationDelay: "180ms" }}
          >
            <a
              href="#catalogo"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-navy-950 transition-transform duration-150 hover:bg-gray-100 active:scale-[0.98]"
            >
              Ver los autos
            </a>
            {perfil?.whatsapp && (
              <a
                href={linkWhatsapp(perfil.whatsapp, `Hola! Los contacto desde la pagina de ${nombre}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition-[background-color,transform] duration-150 hover:bg-white/10 active:scale-[0.98]"
              >
                Escribinos por WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
