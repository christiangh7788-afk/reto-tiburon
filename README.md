# Reto Tiburón — Versión 1.3 con audio

Aplicación web instalable (PWA) para probar en celular y publicar en GitHub Pages.

## Funciones incluidas

- Inicio local por nombre y número de sucursal.
- Diseño móvil con el tiburón oficial.
- 30 misiones diferentes de venta y ejecución comercial.
- Validación por porcentaje, piezas, operaciones, cañonetos o pesos.
- Netopesos, bonos de racha, avance mensual y evidencias opcionales.
- Ranking de tiendas de demostración.
- Calendario completo de misiones.
- Guardado local en el dispositivo.
- Instalación como app y funcionamiento sin conexión después de la primera carga.

## Audio nuevo de la V1.3

- Música original de fondo en bucle.
- Música más intensa durante retos semanales y la gran final.
- Sonido al pulsar botones.
- Sonido de monedas al ganar netopesos.
- Fanfarria de misión cumplida.
- Sonido de error cuando no se alcanza la meta.
- Celebración cada tres días de racha.
- Sonido especial al subir de posición en el ranking.
- Controles separados para música y efectos.
- Controles de volumen con preferencias guardadas en el celular.

Los navegadores móviles no permiten iniciar música antes del primer toque. La música comienza al pulsar **Comenzar reto**, **Modo demostración** o el botón **Activar música y sonidos**.

## Publicar en GitHub Pages

1. Descomprime el ZIP.
2. Reemplaza en el repositorio todos los archivos anteriores por los de esta carpeta.
3. Sube también la carpeta completa `assets`, incluida `assets/audio`.
4. Confirma con **Commit changes**.
5. Espera unos minutos y abre la app agregando `?v=13` al final de la dirección para evitar la caché anterior.

Ejemplo:

```text
https://TU-USUARIO.github.io/reto-tiburon/?v=13
```

## Probar en computadora

La PWA debe abrirse desde un servidor local:

```bash
python3 -m http.server 8080
```

Después abre `http://localhost:8080`.

## Alcance

El avance se guarda localmente en cada dispositivo. Para compartir un ranking real entre todas las sucursales hace falta conectar una base de datos y un backend central.
