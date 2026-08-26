'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import type { RevisionItem } from '@/types/revision';
import {
  useAsignarProveedor,
  useCrearYAsignarProveedor,
  useConfirmarDuplicado,
  useNoEsDuplicado,
  useDescartarRevision,
} from '@/hooks/use-revision';

const TIPO_LABEL: Record<RevisionItem['tipo'], string> = {
  proveedor_ambiguo: 'Proveedor sin identificar',
  posible_duplicado: 'Posible duplicado',
  dato_incompleto: 'Datos incompletos',
  rubro_ambiguo: 'Rubro sin identificar',
};

export function RevisionCard({ item }: { item: RevisionItem }) {
  const asignar = useAsignarProveedor();
  const crear = useCrearYAsignarProveedor();
  const confirmarDup = useConfirmarDuplicado();
  const noDup = useNoEsDuplicado();
  const descartar = useDescartarRevision();
  const [nuevoNombre, setNuevoNombre] = useState(
    item.payload.raw_nombre ?? ''
  );

  const busy =
    asignar.isPending ||
    crear.isPending ||
    confirmarDup.isPending ||
    noDup.isPending ||
    descartar.isPending;

  const run = (p: Promise<unknown>, ok: string) =>
    toast.promise(p, { loading: 'Guardando...', success: ok, error: (e) => (e as Error).message });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-base">{item.titulo}</CardTitle>
          <Badge variant="outline">{TIPO_LABEL[item.tipo]}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderBody()}
      </CardContent>
    </Card>
  );

  function renderBody() {
    switch (item.tipo) {
      case 'proveedor_ambiguo':
        return (
          <>
            <p className="text-sm text-muted-foreground">
              La factura vino a nombre de{' '}
              <span className="font-medium text-foreground">
                &ldquo;{item.payload.raw_nombre ?? 'desconocido'}&rdquo;
              </span>
              . ¿A qué proveedor corresponde?
            </p>

            {(item.payload.candidatos?.length ?? 0) > 0 && (
              <div className="space-y-2">
                {item.payload.candidatos!.map((c) => (
                  <div
                    key={c.proveedor_id}
                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                  >
                    <span className="text-sm">
                      {c.nombre}{' '}
                      <span className="text-muted-foreground">
                        ({Math.round(c.score * 100)}% de coincidencia)
                      </span>
                    </span>
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() =>
                        run(
                          asignar.mutateAsync({ item, arg: c.proveedor_id }),
                          `Asignado a ${c.nombre}.`
                        )
                      }
                    >
                      Es este
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">
                  O crear un proveedor nuevo
                </label>
                <Input
                  value={nuevoNombre}
                  onChange={(e) => setNuevoNombre(e.target.value)}
                  placeholder="Nombre del proveedor"
                />
              </div>
              <Button
                variant="outline"
                disabled={busy || nuevoNombre.trim().length < 2}
                onClick={() =>
                  run(
                    crear.mutateAsync({ item, arg: nuevoNombre.trim() }),
                    'Proveedor creado y asignado.'
                  )
                }
              >
                Crear
              </Button>
            </div>
          </>
        );

      case 'posible_duplicado':
        return (
          <>
            <p className="text-sm text-muted-foreground">
              {(item.payload.motivo as string) ??
                'Coincide con otra factura ya cargada.'}{' '}
              ¿Es la misma factura cargada dos veces?
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                disabled={busy}
                onClick={() =>
                  run(
                    confirmarDup.mutateAsync({ item, arg: undefined }),
                    'Duplicado eliminado.'
                  )
                }
              >
                Sí, es duplicado (eliminar)
              </Button>
              <Button
                variant="outline"
                disabled={busy}
                onClick={() =>
                  run(
                    noDup.mutateAsync({ item, arg: undefined }),
                    'Se mantiene como factura válida.'
                  )
                }
              >
                No, son distintas
              </Button>
            </div>
          </>
        );

      case 'dato_incompleto':
        return (
          <>
            <p className="text-sm text-muted-foreground">
              No se pudieron leer con certeza:{' '}
              <span className="font-medium text-foreground">
                {(item.payload.camposFaltantes ?? []).join(', ')}
              </span>
              . Revisá el archivo original y completá la factura a mano.
            </p>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                run(
                  descartar.mutateAsync({ item, arg: undefined }),
                  'Marcado como revisado.'
                )
              }
            >
              Marcar como revisado
            </Button>
          </>
        );

      case 'rubro_ambiguo':
        return (
          <Button
            variant="outline"
            disabled={busy}
            onClick={() =>
              run(
                descartar.mutateAsync({ item, arg: undefined }),
                'Marcado como revisado.'
              )
            }
          >
            Marcar como revisado
          </Button>
        );

      default: {
        const _exhaustive: never = item.tipo;
        return _exhaustive;
      }
    }
  }
}
