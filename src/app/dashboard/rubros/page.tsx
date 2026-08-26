'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Tags, Plus, Merge } from 'lucide-react';
import { FeatureIcon } from '@/components/ui/feature-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const addAlias = useAddAliasRubro();

  const submit = () => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{rubro.nombre}</CardTitle>
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
            onKeyDown={(e) => e.key === 'Enter' && submit()}
          />
          <Button
            variant="outline"
            size="sm"
            disabled={addAlias.isPending || alias.trim().length < 2}
            onClick={submit}
          >
            Agregar
          </Button>
        </div>
      </CardContent>
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
