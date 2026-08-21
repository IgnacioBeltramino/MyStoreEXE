import { useEffect, useState } from "react";
import { api, type Categoria, type Perfil, type Producto } from "@/lib/api";
import { Encabezado } from "@/components/Encabezado";
import { Portada } from "@/components/Portada";
import { Catalogo } from "@/components/Catalogo";
import { Contacto } from "@/components/Contacto";

type Estado =
  | { fase: "cargando" }
  | { fase: "error" }
  | { fase: "listo"; perfil: Perfil | null; categorias: Categoria[]; productos: Producto[] };

export function App() {
  const [estado, setEstado] = useState<Estado>({ fase: "cargando" });

  useEffect(() => {
    let vigente = true;

    // Las tres llamadas van en paralelo: son independientes y esperarlas en
    // fila triplicaria el tiempo hasta que se ve la pagina.
    Promise.all([api.perfil(), api.categorias(), api.productos()])
      .then(([perfil, categorias, productos]) => {
        if (vigente) setEstado({ fase: "listo", perfil, categorias, productos });
      })
      .catch(() => {
        if (vigente) setEstado({ fase: "error" });
      });

    return () => {
      vigente = false;
    };
  }, []);

  if (estado.fase === "cargando") {
    return <Pantalla mensaje="Cargando..." />;
  }

  if (estado.fase === "error") {
    return (
      <Pantalla mensaje="No pudimos cargar la pagina. Probá recargar en un momento." />
    );
  }

  return (
    <>
      <Encabezado perfil={estado.perfil} />
      <main>
        <Portada perfil={estado.perfil} cantidad={estado.productos.length} />
        <Catalogo
          productos={estado.productos}
          categorias={estado.categorias}
          perfil={estado.perfil}
        />
      </main>
      <Contacto perfil={estado.perfil} />
    </>
  );
}

function Pantalla({ mensaje }: { mensaje: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <p className="text-center text-sm text-gray-400">{mensaje}</p>
    </div>
  );
}
