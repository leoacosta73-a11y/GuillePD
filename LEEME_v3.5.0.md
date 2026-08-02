# GuillePD v3.5.0

Esta versión agrega notificaciones inteligentes e idiomas Español/English sin cambiar la lógica clínica, los cálculos, la sincronización ni la estructura de los informes.

## Publicación

1. Copiar todos los archivos de esta carpeta en la raíz del repositorio `GuillePD`.
2. Confirmar los cambios en GitHub Desktop.
3. Enviar los cambios a GitHub (`Push origin`).
4. Cloudflare publicará automáticamente la nueva versión.

Resumen sugerido para el commit:

`Agregar notificaciones inteligentes y soporte Español/Inglés`

## Notificaciones

- Cada intercambio manual abierto conserva localmente su horario previsto de drenaje.
- El aviso puede repetirse cada 5, 10, 15 o 30 minutos.
- Al registrar el drenaje, el recordatorio se cancela.
- Las preferencias se sincronizan con la cuenta; el permiso se concede por separado en cada dispositivo.
- La entrega con la PWA totalmente cerrada depende de las restricciones de iOS, Android, Windows y del navegador. Al volver a abrir GuillePD se recuperan los avisos vencidos.

## Idiomas

- El idioma seleccionado se guarda en el perfil y se sincroniza.
- La interfaz, los mensajes, las alertas y los informes se adaptan automáticamente.
- El sistema central de traducciones permite sumar nuevos idiomas más adelante.

## Verificaciones realizadas

- Sintaxis de todos los archivos JavaScript y scripts internos.
- Integridad de los archivos PWA.
- Persistencia del idioma.
- Programación, repetición y cancelación de recordatorios.
- Estructura preparada para futuros eventos APD.
- Comparación exacta de la función clínica principal con la versión estable.
