# Playground independiente y preparación para producción

## Estado al pausar

El playground actual vive en `src/index.html` y reúne 42 componentes en 36
ejemplos. Chromium verificó la carga, la navegación por teclado y el reflujo a
320 y 390 px. Pasaron 615 pruebas en 74 suites, además del build y el lint.
Los cambios de esta revisión están sin commit en `main` local. Quedan por abrir
la rama y el PR. La revisión y los hallazgos están en [Estado](status.md).

## Abrir la vista por SSH

Si el servidor del puerto 3434 sigue activo, abre el túnel directamente. Para
volver a levantarlo, ejecuta en este repo en el host remoto:

```bash
npm start -- --address 127.0.0.1 --port 3434 --no-open
```

Desde tu equipo, usa el mismo usuario y host de tu conexión SSH:

```bash
ssh -N -L 3434:127.0.0.1:3434 usuario@host
```

Con el túnel abierto, visita `http://localhost:3434`.

## Librería

La librería será la fuente de verdad del API, las convenciones de tokens, los
tipos y el comportamiento. Revisar nombres, variantes, tamaños, estados,
eventos y slots. Reservar los cambios incompatibles para una versión mayor
con guía de migración.

Antes del merge, verificar reflujo a 320 px y con zoom, navegación y foco por
teclado, nombres y anuncios con lector de pantalla, y contraste en ambos temas
y sets de tokens. Coordinar las correcciones de contraste con el origen de los
tokens. Por ejemplo, el botón sólido Warning de Organic Emerald claro midió
2.15:1 frente al objetivo de 4.5:1 para texto normal.

## Playground

Crear un repo independiente que consuma una versión concreta de la librería
desde el registro. Reutilizar los ejemplos actuales y añadir código
reproducible, variantes, estados, temas, tamaños de pantalla e interacciones.
Empezar con formularios para probar composición, validación, envío, teclado y
lector de pantalla. Añadir después escenarios como un menú dentro de un diálogo.

## Infraestructura y orden de trabajo

1. Crear una rama y abrir un PR con las correcciones de la librería.
2. Tramitar en paralelo el repo del playground con el flujo de infraestructura
   de SliceSoft. Confirmar acceso de CI al registro, hosting estático, previews
   por PR, despliegue desde `main` y dominio y DNS si tendrá una URL propia.
3. Migrar el catálogo y verificar el primer flujo de formularios. Para probar
   cambios antes de publicar una versión, CI puede instalar el paquete generado
   por el PR de la librería.
