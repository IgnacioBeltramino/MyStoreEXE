import { useState } from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useProfile, useSaveProfile } from "@/hooks/useProfile";
import { apiError } from "@/lib/errors";
import type { StoreProfile, StoreProfileInput } from "@/lib/types";

function aFormulario(profile: StoreProfile | null): StoreProfileInput {
  return {
    business_name: profile?.business_name ?? "",
    description: profile?.description ?? null,
    phone: profile?.phone ?? null,
    address: profile?.address ?? null,
    logo_url: profile?.logo_url ?? null,
  };
}

/** El formulario se monta recien cuando el perfil ya llego, asi el estado
 *  inicial sale directo de los datos y no hace falta sincronizarlo por efecto. */
function ProfileForm({ profile }: { profile: StoreProfile | null }) {
  const save = useSaveProfile();
  const { toast } = useToast();
  const [form, setForm] = useState<StoreProfileInput>(() => aFormulario(profile));
  const [touched, setTouched] = useState(false);

  const set = (campo: keyof StoreProfileInput) => (valor: string) =>
    setForm((f) => ({ ...f, [campo]: campo === "business_name" ? valor : valor || null }));

  const nombreInvalido = touched && !form.business_name.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!form.business_name.trim()) return;

    save.mutate(
      { ...form, business_name: form.business_name.trim() },
      {
        onSuccess: () => toast({ variant: "success", title: "Perfil guardado" }),
        onError: (error) =>
          toast({ variant: "error", title: "No se pudo guardar", description: apiError(error) }),
      }
    );
  };

  return (
    <>
      {!profile && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.07] p-4">
          <Store size={18} className="mt-0.5 shrink-0 text-blue-400" />
          <p className="text-sm text-gray-300">
            Todavia no configuraste tu tienda. Completa al menos el nombre para empezar.
          </p>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="business_name">
                Nombre del negocio <span className="text-red-400">*</span>
              </Label>
              <Input
                id="business_name"
                value={form.business_name}
                onChange={(e) => set("business_name")(e.target.value)}
                onBlur={() => setTouched(true)}
                placeholder="Mi Tienda"
                aria-invalid={nombreInvalido}
                className={nombreInvalido ? "border-red-500/50 focus-visible:ring-red-500" : ""}
              />
              {nombreInvalido && (
                <p className="text-xs text-red-400">El nombre del negocio es obligatorio.</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                value={form.description ?? ""}
                onChange={(e) => set("description")(e.target.value)}
                placeholder="Contale a tus clientes que vendes."
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={form.phone ?? ""}
                  onChange={(e) => set("phone")(e.target.value)}
                  placeholder="+54 11 5555-5555"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address">Direccion</Label>
                <Input
                  id="address"
                  value={form.address ?? ""}
                  onChange={(e) => set("address")(e.target.value)}
                  placeholder="Av. Siempreviva 742"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="logo_url">Logo (URL)</Label>
              <Input
                id="logo_url"
                value={form.logo_url ?? ""}
                onChange={(e) => set("logo_url")(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end border-t border-white/[0.06] pt-5">
              <Button type="submit" disabled={save.isPending}>
                {save.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
}

export function ProfilePage() {
  const { data: profile, isLoading, isError, refetch } = useProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Mi Tienda</h1>
        <p className="text-gray-500 text-sm mt-1">
          Estos datos son los que ven tus clientes en la tienda.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 space-y-5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-9 w-full" />
              </div>
            ))}
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="p-10 text-center">
            <p className="text-sm text-gray-400">No pudimos cargar el perfil de tu tienda.</p>
            <Button variant="outline" className="mt-4" onClick={() => refetch()}>
              Reintentar
            </Button>
          </CardContent>
        </Card>
      ) : (
        <ProfileForm profile={profile ?? null} />
      )}
    </div>
  );
}
