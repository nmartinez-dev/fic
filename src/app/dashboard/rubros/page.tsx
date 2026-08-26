'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Tags, Plus, Merge, Pencil, Trash2 } from 'lucide-react';
import { FeatureIcon } from '@/components/ui/feature-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IconButton, IconTooltip, iconButtonClassName } from '@/components/ui/icon-button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useRubrosConAlias,
  useGastoPorRubro,
  useCreateRubro,
  useAddAliasRubro,
  useMergeRubros,
  useUpdateRubro,
  useDeleteRubro,
} from '@/hooks/use-rubros';
import { formatCurrency } from '@/lib/format';
import type { RubroConAlias } from '@/types/rubro';

export default function RubrosPage() {
  const { data: rubros, isLoading } = useRubrosConAlias();
  const { data: gasto } = useGastoPorRubro();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FeatureIcon icon={Tags} size="md" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Rubros</h1>
            <p className="text-sm text-muted-foreground">
              Un mismo rubro escrito de varias formas se unifica en uno solo.
              Así el gasto por tipo de producto sale bien sumado.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <NuevoRubroButton />
          <FusionarRubrosDialog rubros={rubros ?? []} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gasto por rubro</CardTitle>
        </CardHeader>
        <CardContent>
          {!gasto || gasto.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no hay facturas confirmadas para sumar.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr>
                    <th className="py-2 font-medium">Rubro</th>
                    <th className="py-2 text-right font-medium">Facturas</th>
                    <th className="py-2 text-right font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {gasto.map((g) => (
                    <tr key={g.rubro_id ?? 'sin'} className="border-t">
                      <td className="py-2">{g.rubro}</td>
                      <td className="py-2 text-right tabular-nums">
                        {g.facturas}
                      </td>
                      <td className="py-2 text-right font-medium tabular-nums">
                        {formatCurrency(g.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(rubros ?? []).map((r) => (
            <RubroCard key={r.id} rubro={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function RubroCard({ rubro }: { rubro: RubroConAlias }) {
  const [alias, setAlias] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [nombre, setNombre] = useState(rubro.nombre);
  const addAlias = useAddAliasRubro();
  const update = useUpdateRubro();
  const eliminar = useDeleteRubro();

  const refs = (rubro.facturas_count ?? 0) + (rubro.ventas_count ?? 0);
  const deleteTooltip =
    refs > 0
      ? 'Eliminar — tiene facturas o ventas asociadas (fusioná antes)'
      : 'Eliminar rubro';

  const submitAlias = () => {
    const value = alias.trim();
    if (value.length < 2) return;
    toast.promise(addAlias.mutateAsync({ rubroId: rubro.id, alias: value }), {
      loading: 'Guardando...',
      success: () => {
        setAlias('');
        return 'Alias agregado.';
      },
      error: (e) => (e as Error).message,
    });
  };

  const submitEdit = () => {
    const value = nombre.trim();
    if (value.length < 2) return;
    toast.promise(update.mutateAsync({ id: rubro.id, nombre: value }), {
      loading: 'Guardando...',
      success: () => {
        setEditOpen(false);
        return 'Rubro actualizado.';
      },
      error: (e) => (e as Error).message,
    });
  };

  const confirmDelete = () => {
    toast.promise(eliminar.mutateAsync(rubro.id), {
      loading: 'Eliminando...',
      success: 'Rubro eliminado.',
      error: (e) => (e as Error).message,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base">{rubro.nombre}</CardTitle>
          <div className="flex gap-1">
            <IconButton
              tooltip="Editar rubro"
              onClick={() => {
                setNombre(rubro.nombre);
                setEditOpen(true);
              }}
            >
              <Pencil className="h-4 w-4" />
            </IconButton>
            <AlertDialog>
              <IconTooltip label={deleteTooltip}>
                <AlertDialogTrigger asChild>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    className={iconButtonClassName}
                    aria-label={deleteTooltip}
                    disabled={refs > 0 || eliminar.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
              </IconTooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Eliminar rubro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Se borrará <span className="font-medium">{rubro.nombre}</span>{' '}
                    y sus variantes. Esta acción no se puede deshacer.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete}>
                    Eliminar
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {rubro.rubro_alias.length === 0 ? (
            <span className="text-xs text-muted-foreground">
              Sin variantes registradas.
            </span>
          ) : (
            rubro.rubro_alias.map((a) => (
              <Badge key={a.id} variant="outline">
                {a.alias}
              </Badge>
            ))
          )}
        </div>
        <div className="flex items-end gap-2">
          <Input
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="Otra forma de escribirlo"
            onKeyDown={(e) => e.key === 'Enter' && submitAlias()}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={addAlias.isPending || alias.trim().length < 2}
            onClick={submitAlias}
          >
            Agregar
          </Button>
        </div>
      </CardContent>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar rubro</DialogTitle>
            <DialogDescription>
              Cambiá el nombre canónico. Las variantes (alias) se mantienen.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor={`rubro-edit-${rubro.id}`}>Nombre</Label>
            <Input
              id={`rubro-edit-${rubro.id}`}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={submitEdit}
              disabled={update.isPending || nombre.trim().length < 2}
            >
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function NuevoRubroButton() {
  const [open, setOpen] = useState(false);
  const [nombre, setNombre] = useState('');
  const crear = useCreateRubro();

  const submit = () => {
    const value = nombre.trim();
    if (value.length < 2) return;
    toast.promise(crear.mutateAsync(value), {
      loading: 'Creando...',
      success: () => {
        setOpen(false);
        setNombre('');
        return 'Rubro creado.';
      },
      error: (e) => (e as Error).message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo rubro
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo rubro</DialogTitle>
          <DialogDescription>
            El nombre canónico. Las variantes se agregan como alias.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          <Label htmlFor="rubro-nombre">Nombre</Label>
          <Input
            id="rubro-nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej: Electricidad"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={crear.isPending}>
            Crear
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FusionarRubrosDialog({ rubros }: { rubros: RubroConAlias[] }) {
  const [open, setOpen] = useState(false);
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const merge = useMergeRubros();

  const invalido = !origen || !destino || origen === destino;

  const submit = () => {
    toast.promise(merge.mutateAsync({ origen, destino }), {
      loading: 'Fusionando...',
      success: () => {
        setOpen(false);
        setOrigen('');
        setDestino('');
        return 'Rubros fusionados.';
      },
      error: (e) => (e as Error).message,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Merge className="mr-2 h-4 w-4" />
          Fusionar
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fusionar rubros</DialogTitle>
          <DialogDescription>
            El rubro origen desaparece: sus facturas, ventas y variantes pasan
            al destino. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Origen (se elimina)</Label>
            <Select value={origen} onValueChange={setOrigen}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Rubro a absorber" />
              </SelectTrigger>
              <SelectContent>
                {rubros.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Destino (se conserva)</Label>
            <Select value={destino} onValueChange={setDestino}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Rubro que queda" />
              </SelectTrigger>
              <SelectContent>
                {rubros.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={invalido || merge.isPending}>
            Fusionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
