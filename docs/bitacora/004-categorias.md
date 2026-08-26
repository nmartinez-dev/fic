# 004 — Categorías

**Problema del PDF:** #7 — *Las categorías (misma categoría escrita de 5 formas)*  
**Estado:** implementado

En las facturas a veces aparece “Electricidad”, “ELECTRICIDAD”, “Mat. eléctrico”…
y es lo mismo. Si no se unifica, **el gasto por tipo de producto sale mal sumado**.

## Qué quedó hecho

### Pantalla Categorías

- Lista de categorías con su **nombre oficial** y las **formas alternativas** que ya conoce el sistema.
- **Nueva categoría**, agregar otra forma de escribirla, **fusionar** dos que eran la misma (una desaparece y todo queda bajo la otra).
- **Editar** el nombre y **eliminar** las que no tienen facturas ni ventas asociadas.
- En cada **forma alternativa** se puede **borrarla** (si estaba mal, se elimina y se agrega la correcta).
- Tabla de **gasto por categoría** (solo facturas ya confirmadas).

### Al subir una factura

- Si el documento trae categoría, el sistema intenta reconocerla — igual que con el proveedor.
- Si la reconoce con claridad, la asigna sola y aprende esa forma para la próxima.
- Si no está seguro, manda un aviso a **Revisión** para que alguien elija.
- **Importante:** que la categoría quede dudosa **no frena** la factura. La cuenta corriente sigue igual; esto es para el reporte de gastos.

### Revisión

- Elegir una categoría existente, crear una nueva u **omitir** (es opcional).

### Facturas

- Columna **Categoría** en la lista.
- Al **editar** una factura se puede cambiar a mano.

### Quién lo ve

- **Admin** y **Compras** (Marcela). Ventas no.

## Mejoras que se podrían sumar después

- [ ] Gasto por **líneas** de cada factura, no solo por la categoría de la cabecera.
- [ ] Categoría al importar ventas.
