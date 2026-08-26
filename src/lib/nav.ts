import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  FileText,
  ClipboardList,
  Tags,
  Tag,
  Inbox,
  Settings,
  Users,
} from 'lucide-react';
import type { Area, Role } from '@/types/roles';
import { canAccess } from '@/types/roles';

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  area: Area;
};

/** Tabs visibles en el menú principal (alcance de entrega). */
export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard, area: 'dashboard' },
  { href: '/dashboard/facturas', label: 'Facturas', icon: FileText, area: 'facturas' },
  { href: '/dashboard/ordenes', label: 'Órdenes', icon: ClipboardList, area: 'ordenes' },
  { href: '/dashboard/categorias', label: 'Categorías', icon: Tags, area: 'categorias' },
  { href: '/dashboard/precios', label: 'Precios', icon: Tag, area: 'precios' },
  { href: '/dashboard/revision', label: 'Revisión', icon: Inbox, area: 'revision' },
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: Users, area: 'usuarios' },
  { href: '/dashboard/settings', label: 'Ajustes', icon: Settings, area: 'settings' },
];

export function navItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => canAccess(role, item.area));
}
