# GuillePD v3.6.3

## Informe hídrico unificado

- El encabezado y el diseño general del informe hídrico ahora coinciden con los informes de diálisis.
- El detalle diario se presenta como un balance: ingresos por boca a la izquierda y egresos de orina a la derecha.
- Se muestran los totales de cada lado sin modificar ningún cálculo ni registro existente.

Esta versión hace opcional el registro de líquidos y orina y corrige los parciales del balance hídrico para considerar únicamente intercambios manuales terminados.

## Activación opcional

En **Ajustes → Registro de líquidos y orina** se puede habilitar o deshabilitar el módulo.

- Al habilitarlo, aparece en Inicio la tarjeta de balance hídrico y se permite registrar líquidos por boca y orina.
- Al deshabilitarlo, la tarjeta se oculta.
- Los registros existentes no se eliminan.
- La preferencia pertenece al paciente y se sincroniza con la cuenta.

Los pacientes nuevos comienzan con el módulo desactivado. Si una copia anterior ya contiene registros de líquidos u orina, la actualización lo habilita automáticamente para conservar la continuidad.

## Intercambios terminados

Los parciales de diálisis del balance hídrico suman únicamente intercambios que ya tienen infusión y drenaje completos.

- Un intercambio abierto no agrega temporalmente su volumen infundido al balance hídrico.
- Cuando se registra el drenaje y el intercambio queda cerrado, se incorporan juntos el volumen infundido y el drenado.
- APD mantiene su comportamiento anterior y solo incorpora tratamientos finalizados.

## Sin cambios

- Cálculos propios de los intercambios manuales.
- Balance de cada intercambio.
- Registro y cálculo APD.
- Informes clínicos existentes.
- Sincronización, respaldo y funcionamiento sin conexión.

## Publicación

Reemplazá en el repositorio todos los archivos por los de esta carpeta, hacé el commit y luego `Push origin`. Cloudflare publicará la versión automáticamente.

Resumen sugerido para el commit:

`Hacer opcional el registro hídrico y excluir intercambios pendientes`
