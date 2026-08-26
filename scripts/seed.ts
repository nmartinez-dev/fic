/**
 * Seed de demo para Cordillera.
 *
 * Uso:
 *   npm run seed              → sincroniza usuarios demo (roles + contraseña)
 *   npm run seed -- --with-data  → usuarios + datos de ejemplo (solo si no hay proveedores)
 *
 * Requiere .env.local con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type Role = 'admin' | 'compras' | 'ventas';

const DEMO_PASSWORD = 'cordillera2026';

const DEMO_USERS: ReadonlyArray<{
  email: string;
  role: Role;
  full_name: string;
}> = [
  { email: 'admin@cordillera.com', role: 'admin', full_name: 'Admin' },
  { email: 'marcela@cordillera.com', role: 'compras', full_name: 'Marcela' },
  { email: 'julian@cordillera.com', role: 'ventas', full_name: 'Julián' },
];

function createAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local'
    );
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function findUserIdByEmail(
  admin: SupabaseClient,
  email: string
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  const { data, error } = await admin
    .from('profiles')
    .select('id')
    .eq('email', normalized)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

async function ensureDemoUser(
  admin: SupabaseClient,
  user: (typeof DEMO_USERS)[number]
): Promise<void> {
  const email = user.email.trim().toLowerCase();
  const existingId = await findUserIdByEmail(admin, email);

  if (existingId) {
    const { error: authErr } = await admin.auth.admin.updateUserById(existingId, {
      password: DEMO_PASSWORD,
      email_confirm: true,
      app_metadata: { role: user.role },
      user_metadata: { full_name: user.full_name },
    });
    if (authErr) throw new Error(authErr.message);

    const { error: profileErr } = await admin
      .from('profiles')
      .update({ role: user.role, full_name: user.full_name, email })
      .eq('id', existingId);
    if (profileErr) throw new Error(profileErr.message);

    console.log(`  ✓ ${email} (${user.role}) — actualizado`);
    return;
  }

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    app_metadata: { role: user.role },
    user_metadata: { full_name: user.full_name },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error(`No se pudo crear ${email}`);

  const { error: profileErr } = await admin.from('profiles').upsert({
    id: data.user.id,
    email,
    full_name: user.full_name,
    role: user.role,
  });
  if (profileErr) throw new Error(profileErr.message);

  console.log(`  ✓ ${email} (${user.role}) — creado`);
}

async function ensureDemoUsers(admin: SupabaseClient): Promise<void> {
  console.log('Usuarios demo');
  for (const user of DEMO_USERS) {
    await ensureDemoUser(admin, user);
  }
}

async function isDemoDataEmpty(admin: SupabaseClient): Promise<boolean> {
  const { count, error } = await admin
    .from('proveedores')
    .select('*', { count: 'exact', head: true });
  if (error) throw new Error(error.message);
  return (count ?? 0) === 0;
}

async function seedDemoData(admin: SupabaseClient): Promise<void> {
  console.log('Datos de ejemplo');

  const { data: prov, error: provErr } = await admin
    .from('proveedores')
    .insert({
      nombre: 'Ferretería Industrial Norte',
      cuit: '30-71234567-8',
      email: 'ventas@finorte.com.ar',
      terminos_pago_dias: 30,
    })
    .select('id')
    .single();
  if (provErr) throw new Error(provErr.message);

  const proveedorId = prov.id as string;

  await admin.from('proveedor_alias').insert([
    { proveedor_id: proveedorId, alias: 'Ferreteria XYZ del Norte' },
    { proveedor_id: proveedorId, alias: 'F.I. Norte' },
  ]);

  const rubros = ['Herramientas', 'Pinturas', 'Sanitarios', 'Electricidad'];
  const rubroIds: Record<string, string> = {};
  for (const nombre of rubros) {
    const { data, error } = await admin
      .from('rubros')
      .insert({ nombre })
      .select('id')
      .single();
    if (error) throw new Error(error.message);
    rubroIds[nombre] = data.id as string;
  }

  await admin.from('rubro_alias').insert([
    { rubro_id: rubroIds.Herramientas, alias: 'Herram' },
    { rubro_id: rubroIds.Pinturas, alias: 'Pintura' },
  ]);

  const hoy = new Date().toISOString().slice(0, 10);
  const hace20Dias = new Date(Date.now() - 20 * 86400000).toISOString().slice(0, 10);
  const hace45Dias = new Date(Date.now() - 45 * 86400000).toISOString().slice(0, 10);

  const facturas = [
    {
      proveedor_id: proveedorId,
      raw_proveedor_nombre: 'Ferretería Industrial Norte',
      numero: 'FAC-2024-001',
      fecha: hace20Dias,
      fecha_vencimiento: hoy,
      total: 100_000,
      rubro_id: rubroIds.Herramientas,
      estado_pago: 'parcial',
      estado: 'confirmada',
      origen: 'pdf',
      hash_dedup: 'demo-fac-001',
    },
    {
      proveedor_id: proveedorId,
      raw_proveedor_nombre: 'Ferretería Industrial Norte',
      numero: 'FAC-2024-002',
      fecha: hace20Dias,
      fecha_vencimiento: hoy,
      total: 50_000,
      rubro_id: rubroIds.Pinturas,
      estado_pago: 'sin_pagar',
      estado: 'confirmada',
      origen: 'excel',
      hash_dedup: 'demo-fac-002',
    },
    {
      proveedor_id: proveedorId,
      raw_proveedor_nombre: 'Ferretería Industrial Norte',
      numero: 'FAC-2024-003',
      fecha: hace45Dias,
      total: 16_666.66,
      rubro_id: rubroIds.Sanitarios,
      estado_pago: 'saldada',
      estado: 'confirmada',
      origen: 'pdf',
      hash_dedup: 'demo-fac-003',
    },
    {
      proveedor_id: null,
      raw_proveedor_nombre: 'Ferreteria XYZ del Norte',
      numero: 'FAC-2024-099',
      fecha: hoy,
      total: 25_000,
      rubro_id: null,
      estado_pago: 'sin_pagar',
      estado: 'en_revision',
      origen: 'pdf_escaneado',
      hash_dedup: 'demo-fac-099',
    },
  ];

  const { data: facturasInserted, error: facErr } = await admin
    .from('facturas')
    .insert(facturas)
    .select('id, numero, estado');
  if (facErr) throw new Error(facErr.message);

  const facByNum = Object.fromEntries(
    (facturasInserted ?? []).map((f) => [f.numero as string, f.id as string])
  );

  await admin.from('pagos').insert([
    {
      factura_id: facByNum['FAC-2024-001'],
      proveedor_id: proveedorId,
      fecha: hace20Dias,
      monto: 33_333.34,
      medio: 'transferencia',
    },
    {
      factura_id: facByNum['FAC-2024-003'],
      proveedor_id: proveedorId,
      fecha: hace45Dias,
      monto: 16_666.66,
      medio: 'transferencia',
    },
  ]);

  await admin.from('revision_queue').insert([
    {
      tipo: 'proveedor_ambiguo',
      entidad: 'factura',
      entidad_id: facByNum['FAC-2024-099'],
      titulo: 'Proveedor ambiguo en factura FAC-2024-099',
      payload: {
        raw_nombre: 'Ferreteria XYZ del Norte',
        candidatos: [
          {
            proveedor_id: proveedorId,
            nombre: 'Ferretería Industrial Norte',
            score: 0.48,
            via: 'alias',
          },
        ],
      },
    },
    {
      tipo: 'posible_duplicado',
      entidad: 'factura',
      entidad_id: facByNum['FAC-2024-099'],
      titulo: 'Posible duplicado de FAC-2024-001',
      payload: {
        factura_original: 'FAC-2024-001',
        motivo: 'Mismo proveedor y total similar',
      },
    },
  ]);

  const { data: ordenes, error: ordErr } = await admin
    .from('ordenes_compra')
    .insert([
      {
        proveedor_id: proveedorId,
        numero: 'OC-2024-010',
        fecha: hace45Dias,
        total: 80_000,
        estado: 'pendiente',
        descripcion: 'Bulones y tuercas M8',
      },
      {
        proveedor_id: proveedorId,
        numero: 'OC-2024-011',
        fecha: hace20Dias,
        total: 12_500,
        estado: 'parcial',
        descripcion: 'Pintura latex interior 20L',
      },
    ])
    .select('id, numero');
  if (ordErr) throw new Error(ordErr.message);

  await admin.from('ventas').insert([
    {
      codigo: 'VT-1001',
      fecha: '2024-06-15',
      producto: 'Amoladora 4"',
      rubro_id: rubroIds.Herramientas,
      cantidad: 2,
      precio_unitario: 45_000,
      total: 90_000,
      estado_dato: 'valida',
    },
    {
      codigo: 'VT-1001',
      fecha: '2024-06-15',
      producto: 'Amoladora 4" (dup)',
      rubro_id: rubroIds.Herramientas,
      cantidad: 2,
      precio_unitario: 45_000,
      total: 90_000,
      estado_dato: 'duplicada',
      motivo_flag: 'Código VT-1001 repetido',
    },
    {
      codigo: 'VT-ROTA',
      fecha: '2024-07-01',
      producto: null,
      total: null,
      estado_dato: 'rota',
      motivo_flag: 'Fila sin total ni producto',
    },
  ]);

  console.log(`  ✓ ${rubros.length} categorías, ${facturas.length} facturas`);
  console.log(`  ✓ ${ordenes?.length ?? 0} órdenes, ventas de ejemplo`);
  console.log('  ℹ Precios: ejecutá sync desde la app o cron del portal');
}

async function main(): Promise<void> {
  const withData = process.argv.includes('--with-data');
  const admin = createAdminClient();

  await ensureDemoUsers(admin);

  const empty = await isDemoDataEmpty(admin);
  if (withData && empty) {
    await seedDemoData(admin);
  } else if (withData && !empty) {
    console.log('Datos de ejemplo omitidos (ya hay proveedores cargados)');
  } else if (!withData && empty) {
    console.log(
      'Base vacía: podés cargar datos demo con  npm run seed -- --with-data'
    );
  }

  console.log('\nListo. Clave demo:', DEMO_PASSWORD);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
