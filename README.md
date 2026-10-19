# FacilGest

Prototipo de espacio ciudadano, con diseño adaptable a móvil y escritorio. HTML, CSS y JavaScript sin dependencias de producción.

## Desarrollo

Desde el repositorio:

```sh
python -m http.server 8000 --bind 127.0.0.1
```

## Pruebas

Con el servidor en ejecución, Python Playwright y Chromium instalados:

```sh
node --check script.js
python tests/smoke.py
python tests/theme.py
```

La prueba usa `/usr/bin/chromium`, disponible en el entorno cloud. Comprueba acceso y cierre de sesión simulados, búsqueda combinada con filtros, validación, resumen, persistencia de borradores, envío demo, almacenamiento corrupto, representación segura de texto y adaptación a cuatro anchuras de pantalla. Guarda capturas en `/tmp/facilgest-desktop.png` y `/tmp/facilgest-mobile.png`.

## Apariencia

El interruptor de la cabecera alterna entre modo claro y oscuro en todas las pantallas. La primera visita sigue el tema del sistema; la selección manual se conserva en el navegador y se sincroniza entre pestañas. Funciona también cuando el almacenamiento está deshabilitado, sin persistencia en ese caso.

## Alcance de la demo

El acceso es simulado: no proporciona autenticación ni protección de rutas. Utiliza datos inventados. Los expedientes son ejemplos estáticos y los documentos se representan mediante un nombre de archivo; no se suben archivos. Los borradores se guardan en el navegador. El envío genera una confirmación de demostración, sin conexión a un registro oficial ni backend.
