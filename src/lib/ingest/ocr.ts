import 'server-only';
import { generateObject } from 'ai';
import { z } from 'zod';
import type { FacturaExtraida, OrigenFactura } from '@/types/factura';

const facturaSchema = z.object({
  proveedorNombre: z.string().nullable(),
  categoriaNombre: z
    .string()
    .nullable()
    .describe('Categoría de productos de la factura, si aparece'),
  numero: z.string().nullable(),
  fecha: z
    .string()
    .nullable()
    .describe('Fecha de la factura en formato YYYY-MM-DD'),
  total: z.number().nullable().describe('Importe total final de la factura'),
});

const OCR_MODEL = process.env.OCR_AI_MODEL ?? 'openai/gpt-4o-mini';

/**
 * OCR + extraccion estructurada de una factura escaneada usando un modelo de
 * vision via Vercel AI Gateway. Devuelve null si no hay clave configurada o
 * si la extraccion falla: en ese caso la factura cae en la cola de revision.
 */
export async function extractWithAI(
  fileBytes: Uint8Array,
  mediaType: string,
  origen: OrigenFactura
): Promise<FacturaExtraida | null> {
  if (!process.env.AI_GATEWAY_API_KEY) return null;

  try {
    const { object } = await generateObject({
      model: OCR_MODEL,
      schema: facturaSchema,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text:
                'Extraé los datos de esta factura de un proveedor argentino. ' +
                'Devolvé el nombre del proveedor, la categoría de productos (si aparece), ' +
                'el número de factura, la fecha (YYYY-MM-DD) y el importe total. ' +
                'Si algún dato no está, devolvé null.',
            },
            { type: 'file', data: fileBytes, mediaType },
          ],
        },
      ],
    });

    const camposFaltantes: string[] = [];
    if (!object.proveedorNombre) camposFaltantes.push('proveedor');
    if (!object.numero) camposFaltantes.push('numero');
    if (!object.fecha) camposFaltantes.push('fecha');
    if (object.total === null) camposFaltantes.push('total');

    return { ...object, origen, camposFaltantes };
  } catch {
    return null;
  }
}
