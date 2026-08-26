import { areaForTipoAviso } from '@/lib/notificaciones/aviso-meta';
import { canAccess, type Role } from '@/types/roles';
import type { Aviso } from '@/types/aviso';

export function filterAvisosPorRol(avisos: Aviso[], role: Role): Aviso[] {
  return avisos.filter((a) => canAccess(role, areaForTipoAviso(a.tipo)));
}
