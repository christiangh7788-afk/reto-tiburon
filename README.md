# Reto Tiburón — Versión 1

Aplicación web instalable (PWA) para probar en celular.

## Funciones incluidas

- Inicio de sesión local por nombre y número de sucursal.
- Diseño móvil inspirado en la interfaz aprobada.
- 30 misiones diferentes de venta y ejecución comercial.
- Validación de metas por porcentaje, piezas, operaciones, cañonetos o pesos.
- Netopesos, bonos de racha, avance mensual y evidencias opcionales.
- Ranking de tiendas de demostración.
- Calendario completo de misiones.
- Guardado local en el dispositivo.
- Instalación como app y funcionamiento sin conexión después de la primera carga.

## Probarla en computadora

La PWA debe abrirse desde un servidor local, no haciendo doble clic en `index.html`:

```bash
python3 -m http.server 8080
```

Después abre `http://localhost:8080`.

## Probarla en celular

1. Sube la carpeta a un hosting HTTPS como Netlify, Vercel, GitHub Pages o un servidor propio.
2. Abre la dirección desde Chrome o Safari.
3. Usa “Agregar a pantalla de inicio” o la opción “Instalar en el celular” del menú.

## Alcance de esta V1

El avance se guarda localmente. Para que todas las sucursales compartan un ranking real hace falta una fase de backend con usuarios, base de datos, permisos y conexión a ventas reales.


## Corrección V1.1
Se corrigió la pantalla de acceso que permanecía visible después de pulsar los botones y se actualizó la caché de la PWA.
