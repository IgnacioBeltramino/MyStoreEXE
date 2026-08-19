import { useState } from "react";
import { Pencil, Plus, ShoppingBag, Trash2 } from "lucide-react";
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
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { useCategories } from "@/hooks/useCategories";
import {
  useCreateProduct,
  useDeleteProduct,
  useProducts,
  useUpdateProduct,
  type ProductInput,
} from "@/hooks/useProducts";
import { apiError } from "@/lib/errors";
import { formatPrice } from "@/lib/format";
import type { Category, Product } from "@/lib/types";

const VACIO: ProductInput = {
  name: "",
  description: null,
  price: "",
  category_id: null,
  image_url: null,
  sort_order: 0,
};

const SIN_CATEGORIA = "sin-categoria";

/** Igual que en categorias: se monta recien al abrir, asi el estado inicial
 *  sale del producto elegido sin sincronizarlo por efecto. */
function ProductDialog({
  producto,
  categorias,
  onOpenChange,
}: {
  producto: Product | null;
  categorias: Category[];
  onOpenChange: (open: boolean) => void;
}) {
  const crear = useCreateProduct();
  const editar = useUpdateProduct();
  const { toast } = useToast();
  const [form, setForm] = useState<ProductInput>(() =>
    producto
      ? {
          name: producto.name,
          description: producto.description,
          price: producto.price,
          category_id: producto.category_id,
          image_url: producto.image_url,
          sort_order: producto.sort_order,
        }
      : VACIO
  );
  const [touched, setTouched] = useState(false);

  const esEdicion = producto !== null;
  const guardando = crear.isPending || editar.isPending;

  const nombreInvalido = touched && !form.name.trim();
  const precioNumero = Number(form.price);
  const precioInvalido =
    touched && (form.price.trim() === "" || Number.isNaN(precioNumero) || precioNumero < 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!form.name.trim()) return;
    if (form.price.trim() === "" || Number.isNaN(precioNumero) || precioNumero < 0) return;

    const datos: ProductInput = {
      ...form,
      name: form.name.trim(),
      price: precioNumero.toFixed(2),
    };
    const onSuccess = () => {
      toast({ variant: "success", title: esEdicion ? "Producto actualizado" : "Producto creado" });
      onOpenChange(false);
    };
    const onError = (error: unknown) =>
      toast({ variant: "error", title: "No se pudo guardar", description: apiError(error) });

    if (esEdicion) editar.mutate({ id: producto.id, ...datos }, { onSuccess, onError });
    else crear.mutate(datos, { onSuccess, onError });
  };

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? "Editar producto" : "Nuevo producto"}</DialogTitle>
        </DialogHeader>

        {/* noValidate: sin esto el navegador corta el submit por el min="0" del
            precio y muestra su propio tooltip, tapando los mensajes de abajo. */}
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="prod-name">
              Nombre <span className="text-red-400">*</span>
            </Label>
            <Input
              id="prod-name"
              autoFocus
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              onBlur={() => setTouched(true)}
              placeholder="Remera oversize"
              aria-invalid={nombreInvalido}
              className={nombreInvalido ? "border-red-500/50 focus-visible:ring-red-500" : ""}
            />
            {nombreInvalido && <p className="text-xs text-red-400">El nombre es obligatorio.</p>}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prod-price">
                Precio <span className="text-red-400">*</span>
              </Label>
              <Input
                id="prod-price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                onBlur={() => setTouched(true)}
                placeholder="12500.00"
                aria-invalid={precioInvalido}
                className={precioInvalido ? "border-red-500/50 focus-visible:ring-red-500" : ""}
              />
              {precioInvalido && (
                <p className="text-xs text-red-400">Ingresa un precio valido (0 o mayor).</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="prod-cat">Categoria</Label>
              <Select
                id="prod-cat"
                value={form.category_id === null ? SIN_CATEGORIA : String(form.category_id)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    category_id: e.target.value === SIN_CATEGORIA ? null : Number(e.target.value),
                  }))
                }
              >
                <option value={SIN_CATEGORIA}>Sin categoria</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="prod-desc">Descripcion</Label>
            <Textarea
              id="prod-desc"
              value={form.description ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value || null }))}
              placeholder="Algodon peinado 24/1"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="prod-img">Imagen (URL)</Label>
              <Input
                id="prod-img"
                value={form.image_url ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value || null }))}
                placeholder="https://..."
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prod-orden">Orden</Label>
              <Input
                id="prod-orden"
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) || 0 }))}
                className="max-w-28"
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={guardando}>
                Cancelar
              </Button>
            </DialogClose>
            <Button type="submit" disabled={guardando}>
              {guardando ? "Guardando..." : esEdicion ? "Guardar cambios" : "Crear producto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ProductsPage() {
  const [filtro, setFiltro] = useState<number | null>(null);
  const { data: productos, isLoading, isError, refetch } = useProducts(filtro);
  const { data: categorias } = useCategories();
  const borrar = useDeleteProduct();
  const { toast } = useToast();

  const [editando, setEditando] = useState<Product | null>(null);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [aBorrar, setABorrar] = useState<Product | null>(null);

  const nombreCategoria = (id: number | null) =>
    id === null ? null : categorias?.find((c) => c.id === id)?.name ?? null;

  const abrirNuevo = () => {
    setEditando(null);
    setDialogAbierto(true);
  };

  const abrirEdicion = (producto: Product) => {
    setEditando(producto);
    setDialogAbierto(true);
  };

  const confirmarBorrado = () => {
    if (!aBorrar) return;
    borrar.mutate(aBorrar.id, {
      onSuccess: () => {
        toast({ variant: "success", title: "Producto eliminado" });
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
          <h1 className="text-2xl font-bold text-white">Productos</h1>
          <p className="text-gray-500 text-sm mt-1">Lo que se publica en tu tienda.</p>
        </div>
        <Button onClick={abrirNuevo}>
          <Plus size={16} />
          Nuevo producto
        </Button>
      </div>

      {!!categorias?.length && (
        <div className="flex items-center gap-3">
          <Label htmlFor="filtro-cat" className="shrink-0 text-gray-500">
            Filtrar por
          </Label>
          <Select
            id="filtro-cat"
            className="max-w-56"
            value={filtro === null ? "todas" : String(filtro)}
            onChange={(e) => setFiltro(e.target.value === "todas" ? null : Number(e.target.value))}
          >
            <option value="todas">Todas las categorias</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {isLoading ? (
        <Card>
          <CardContent className="p-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </CardContent>
        </Card>
      ) : isError ? (
        <ErrorState message="No pudimos cargar los productos." onRetry={refetch} />
      ) : !productos?.length ? (
        <EmptyState
          icon={ShoppingBag}
          title={filtro === null ? "Todavia no tenes productos" : "No hay productos en esta categoria"}
          description={
            filtro === null
              ? "Carga el primero para empezar a vender."
              : "Proba con otra categoria o crea uno nuevo."
          }
          actionLabel="Nuevo producto"
          onAction={abrirNuevo}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left">
                  <th className="px-6 py-3 font-medium text-gray-500">Nombre</th>
                  <th className="px-6 py-3 font-medium text-gray-500">Categoria</th>
                  <th className="px-6 py-3 font-medium text-gray-500 text-right">Precio</th>
                  <th className="px-6 py-3 font-medium text-gray-500 w-20">Orden</th>
                  <th className="px-6 py-3 w-24" />
                </tr>
              </thead>
              <tbody>
                {productos.map((producto) => {
                  const categoria = nombreCategoria(producto.category_id);
                  return (
                    <tr
                      key={producto.id}
                      className="border-b border-white/[0.04] last:border-0 transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-3.5">
                        <p className="font-medium text-white">{producto.name}</p>
                        {producto.description && (
                          <p className="mt-0.5 text-xs text-gray-600 line-clamp-1">
                            {producto.description}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        {categoria ? (
                          <span className="rounded-md border border-white/[0.08] bg-white/[0.04] px-2 py-0.5 text-xs text-gray-400">
                            {categoria}
                          </span>
                        ) : (
                          <span className="rounded-md border border-orange-500/20 bg-orange-500/10 px-2 py-0.5 text-xs text-orange-400">
                            Sin categoria
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right font-medium tabular-nums text-white">
                        {formatPrice(producto.price)}
                      </td>
                      <td className="px-6 py-3.5 text-gray-500">{producto.sort_order}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Editar ${producto.name}`}
                            onClick={() => abrirEdicion(producto)}
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Eliminar ${producto.name}`}
                            className="hover:text-red-400"
                            onClick={() => setABorrar(producto)}
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {dialogAbierto && (
        <ProductDialog
          producto={editando}
          categorias={categorias ?? []}
          onOpenChange={setDialogAbierto}
        />
      )}

      <ConfirmDialog
        open={aBorrar !== null}
        onOpenChange={(abierto) => !abierto && setABorrar(null)}
        title={`Eliminar "${aBorrar?.name}"?`}
        description="El producto deja de mostrarse en tu tienda. Se puede recuperar desde la base."
        loading={borrar.isPending}
        onConfirm={confirmarBorrado}
      />
    </div>
  );
}
