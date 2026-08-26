import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Building2,
  FileText,
  ClipboardList,
  Tags,
  Tag,
  CalendarClock,
  Inbox,
  TrendingUp,
  Bell,
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

export const NAV_ITEMS: NavItem[] = [
  { href: '/dashboard', label: 'Resumen', icon: LayoutDashboard, area: 'dashboard' },
  { href: '/dashboard/proveedores', label: 'Proveedores', icon: Building2, area: 'proveedores' },
  { href: '/dashboard/facturas', label: 'Facturas', icon: FileText, area: 'facturas' },
  { href: '/dashboard/ordenes', label: 'Órdenes', icon: ClipboardList, area: 'ordenes' },
  { href: '/dashboard/rubros', label: 'Rubros', icon: Tags, area: 'rubros' },
  { href: '/dashboard/precios', label: 'Precios', icon: Tag, area: 'precios' },
  { href: '/dashboard/vencimientos', label: 'Vencimientos', icon: CalendarClock, area: 'vencimientos' },
  { href: '/dashboard/revision', label: 'Revisión', icon: Inbox, area: 'revision' },
  { href: '/dashboard/ventas', label: 'Ventas', icon: TrendingUp, area: 'ventas' },
  { href: '/dashboard/avisos', label: 'Avisos', icon: Bell, area: 'avisos' },
  { href: '/dashboard/usuarios', label: 'Usuarios', icon: Users, area: 'usuarios' },
  { href: '/dashboard/settings', label: 'Ajustes', icon: Settings, area: 'settings' },
];

export function navItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => canAccess(role, item.area));
}
