import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/common/Logo";
import api from "@/lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.access_token);
      navigate("/");
    } catch {
      setError("Credenciales incorrectas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 lg:p-3">
      <div className="grid min-h-screen lg:min-h-[calc(100vh-1.5rem)] lg:grid-cols-2 lg:gap-3">
        <PanelDeMarca />

        {/* Formulario. Los campos van claros sobre el fondo oscuro: es el
            contraste que define el look, y de paso se leen mejor que los
            inputs translucidos que habia antes. */}
        <main className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-sm">
            <Logo className="mb-10 lg:hidden" />

            <h1 className="text-3xl font-semibold tracking-tight text-white">Hola de nuevo</h1>
            <p className="mt-1.5 text-sm text-gray-400">
              Entra para administrar el catalogo de tu tienda.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-gray-300">
                  Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 border-transparent bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-gray-300">
                  Contrasena
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Tu contrasena"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 border-transparent bg-white text-gray-900 placeholder:text-gray-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                />
              </div>

              {/* role="alert" para que el lector de pantalla lo anuncie: si el
                  form se manda con Enter, el foco queda en el boton y si no
                  nadie se entera de que fallo. */}
              {error && (
                <p
                  role="alert"
                  className="rounded-lg bg-red-400/10 px-3 py-2 text-sm text-red-400"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="h-11 w-full bg-navy-600 text-white transition-transform duration-150 hover:bg-[#33457a] active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? "Ingresando..." : "Ingresar"}
              </Button>
            </form>

            {/* No hay autogestion de contrasena a proposito: el blanqueo lo hace
                el desarrollador con scripts/manage.py password. */}
            <p className="mt-8 text-center text-xs leading-relaxed text-gray-500">
              Si tenes problemas con el acceso o las credenciales, ponete en contacto con
              el desarrollador.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * El panel de marca. Todo el fondo es CSS y SVG a proposito: no depende de
 * ninguna imagen, pesa nada y acompana si cambia la paleta.
 */
function PanelDeMarca() {
  return (
    <aside className="relative hidden overflow-hidden rounded-2xl lg:flex lg:flex-col lg:justify-between">
      {/* Del casi negro de arriba al azul vivo de abajo */}
      <div className="absolute inset-0 bg-[linear-gradient(165deg,#060a14_0%,#0b1730_30%,#17347d_62%,#2f66d6_88%,#3f7bec_100%)]" />

      {/* Puntos tenues, mas densos arriba donde el fondo es oscuro */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 600 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        {[
          [82, 96, 1.4, 0.5], [190, 58, 1, 0.35], [305, 132, 1.2, 0.4],
          [455, 74, 1, 0.3], [522, 188, 1.5, 0.45], [138, 224, 1, 0.3],
          [402, 262, 1.2, 0.35], [246, 330, 1, 0.25], [548, 348, 1.3, 0.3],
          [60, 398, 1, 0.22], [352, 430, 1.1, 0.2],
        ].map(([cx, cy, r, o], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#ffffff" opacity={o} />
        ))}
      </svg>

      {/* Siluetas tipo colina, como la referencia */}
      <svg
        className="absolute inset-x-0 bottom-0 h-[26%] w-full"
        viewBox="0 0 600 200"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 132 C118 96 206 168 322 138 C432 110 508 154 600 122 L600 200 L0 200 Z"
          fill="#0a142c"
          opacity="0.75"
        />
        <path
          d="M0 158 C140 126 232 186 352 158 C462 132 524 172 600 148 L600 200 L0 200 Z"
          fill="#060b18"
        />
      </svg>

      {/* Velo apenas perceptible para que el texto no compita con la parte mas
          clara del gradiente. Tiene tinte azul, no negro: si se oscurece de
          mas se pierde el azul, que es lo que le da caracter al panel. */}
      <div className="absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(to_top,rgba(5,10,26,0.62)_0%,rgba(5,10,26,0.28)_45%,transparent_100%)]" />

      <div className="relative p-10">
        <Logo />
      </div>

      <div className="relative max-w-md p-10">
        <h2 className="text-[32px] font-semibold leading-tight tracking-tight text-white">
          Tu tienda, siempre abierta.
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-blue-50/85">
          Carga tus productos una vez y mostralos a tus clientes las 24 horas, desde
          cualquier telefono.
        </p>
      </div>
    </aside>
  );
}
