import { useState } from "react";
import { Pencil, Plus, Tag, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { ErrorState } from "@/components/common/ErrorState";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import {
  useCategories,
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
  type CategoryInput,
} from "@/hooks/useCategories";
import { apiError } from "@/lib/errors";
import type { Category } from "@/lib/types";

const VACIA: CategoryInput = { name: "", description: null, sort_order: 0 };

/** Solo se monta cuando el modal esta abierto (ver CategoriesPage), asi el
 *  estado inicial sale de la categoria elegida sin tener que sincronizarlo:
 *  Radix no avisa por onOpenChange cuando "open" cambia desde el padre. */
function CategoryDialog({
  categoria,
  onOpenChange,
}: {
  categoria: Category | null;
  onOpenChange: (open: boolean) => void;
}) {
  const crear = useCreateCategory();
  const editar = useUpdateCategory();
  const { toast } = useToast();
  const [form, setForm] = useState<CategoryInput>(() =>
    categoria
      ? {
          name: categoria.name,
          description: categoria.description,
          sort_order: categoria.sort_order,
        }
      : VACIA
  );
  const [touched, setTouched] = useState(false);

  const esEdicion = categoria !== null;
  const guardando = crear.isPending || editar.isPending;
  const nombreInvalido = touched && !form.name.trim();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!form.name.trim()) return;

    const datos = { ...form, name: form.name.trim() };
    const onSuccess = () => {
      toast({ variant: "success", title: esEdicion ? "Categoria actualizada" : "Categoria creada" });
      onOpenChange(false);
    };
    const onError = (error: unknown) =>
      toast({ variant: "error", title: "No se pudo guardar", description: apiError(error) });

    if (esEdicion) editar.mutate({ id: categoria.id, ...datos }, { onSuccess, onError });
    else crear.mutate(datos, { onSuccess, onError });
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar categoria" : "Nueva categoria"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="cat-name">
              Nombre <span className="text-red-400">*</span>
            </Label>
            <Input
              id="cat-name"
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onBlur={() => setTouched(true)}
              placeholder="Ropa"
              aria-invalid={nombreInvalido}
              className={nombreInvalido ? "border-red-500/50 focus-visible:ring-red-500" : ""}
            />
            {nombreInvalido && <p className="text-xs text-red-400">El nombre es obligatorio.</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-desc">Descripcion</Label>
            <Textarea
              id="cat-desc"
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || null }))}
              placeholder="Remeras, buzos y camperas"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cat-orden">Orden</Label>
            <Input
              id="cat-orden"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))}
              className="max-w-28"
            />
            <p className="text-xs text-gray-600">Las de numero mas chico aparecen primero.</p>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={guardando}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear categoria"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CategoriesPage() {
  const { data: categorias, isLoading, isError, refetch } = useCategories();
  const borrar = useDeleteCategory();
  const { toast } = useToast();

  const [editando, setEditando] = useState<Category | null>(null);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [aBorrar, setABorrar] = useState<Category | null>(null);

  const abrirNueva = () => {
    setEditando(null);
    setDialogAbierto(true);
  };

  const abrirEdicion = (categoria: Category) => {
    setEditando(categoria);
    setDialogAbierto(true);
  };

  const confirmarBorrado = () => {
    if (!aBorrar) return;
    borrar.mutate(aBorrar.id, {
      onSuccess: () => {
        toast({ variant: "success", title: "Categoria eliminada" });
        setABorrar(null);
      },
      onError: (error) =>
        toast({ variant: "error", title: "No se pudo eliminar", description: apiError(error) }),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Categorias</h1>
          <p className="text-gray-500 text-sm mt-1">Agrupan los productos de tu tienda.</p>
        </div>
        <Button onClick={abrirNueva}>
          <Plus size={16} />
          Nueva categoria
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : isError ? (
        <ErrorState message="No pudimos cargar las categorias." onRetry={refetch} />
      ) : !categorias?.length ? (
        <EmptyState
          icon={Tag}
          title="Todavia no tenes categorias"
          description="Crea la primera para empezar a organizar tus productos."
          actionLabel="Nueva categoria"
          onAction={abrirNueva}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left">
                  <th className="px-6 py-3 font-medium text-gray-500">Nombre</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Descripcion</th>
                  <th className="px-6 py-3 font-medium text-gray-500 w-20">Orden</th>
                  <th className="px-6 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {categorias.map((categoria) => (
                  <tr
                    key={categoria.id}
                    className="border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-3.5 font-medium text-white">{categoria.name}</td>
                    <td className="px-6 py-3.5 text-gray-500">
                      {categoria.description || <span className="text-gray-700">&mdash;</span>}
                    </td>
                    <td className="px-6 py-3.5 text-gray-500">{categoria.sort_order}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Editar ${categoria.name}`}
                          onClick={() => abrirEdicion(categoria)}
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Eliminar ${categoria.name}`}
                          className="hover:text-red-400"
                          onClick={() => setABorrar(categoria)}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {dialogAbierto && <CategoryDialog categoria={editando} onOpenChange={setDialogAbierto} />}

      <ConfirmDialog
        open={aBorrar !== null}
        onOpenChange={(abierto) => !abierto && setABorrar(null)}
        title={`Eliminar "${aBorrar?.name}"?`}
        description="La categoria deja de estar disponible y los productos que la usaban quedan sin categoria. Se puede recuperar desde la base."
        loading={borrar.isPending}
        onConfirm={confirmarBorrado}
      />
    </div>
  );
}
