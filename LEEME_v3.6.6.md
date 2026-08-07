# GuillePD v3.6.6

## Registros APD visibles e historial unificado

- **Tratamiento APD → Tratamientos APD del día** ahora muestra los datos guardados de la cicladora: UF total, duración indicada, ciclos, volumen por ciclo, último llenado, peso, presión, temperatura, diuresis y observaciones.
- Cada tratamiento APD ofrece las acciones **Editar** o **Completar tratamiento**, y **Eliminar**.
- En **Historial**, los tratamientos APD y los intercambios manuales aparecen juntos dentro del mismo día y ordenados por su hora de inicio.
- Cada tarjeta conserva claramente su tipo: **Tratamiento APD** o **Intercambio manual**.

No se modificaron cálculos, balances, prescripciones ni informes.

## Edición y eliminación de tratamientos APD finalizados

- El Historial ahora muestra **Editar** y **Eliminar** en cada tratamiento APD finalizado.
- Editar permite corregir inicio, finalización, UF, peso, presión, temperatura, diuresis y observaciones.
- La edición conserva la prescripción médica histórica y cualquier drenaje del último llenado ya registrado.
- La eliminación reconoce correctamente el identificador del registro en todos los dispositivos.
- Si existe un drenaje pendiente del último llenado, la confirmación informa que también será eliminado.

Las prescripciones médicas históricas continúan versionadas y no se modifican.

## Funciones conservadas de v3.6.4

## Transición APD → Manual en modalidad Mixta

- Si un tratamiento APD finaliza con **Último llenado = Sí**, GuillePD reconoce que quedó líquido en cavidad.
- Inicio muestra **Drenar último llenado APD** en lugar de ofrecer una nueva infusión.
- El drenaje queda vinculado al tratamiento APD que lo originó y conserva su volumen esperado.
- Hasta guardar ese drenaje no se permite iniciar un intercambio manual completo.
- Después de guardarlo vuelve a habilitarse el flujo Manual normal.
- Si la prescripción indica **Último llenado = No**, el siguiente intercambio Manual comienza normalmente desde la infusión.

El drenaje del último llenado se conserva dentro del registro APD. No se crea un intercambio manual artificial y no se modifican los cálculos, balances ni informes existentes.

## Funciones conservadas de v3.6.3

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

`Mostrar datos APD e integrar el historial mixto`
