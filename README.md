# Reto Tiburón V3.4 — evidencias obligatorias

## Cambios

### Misión diaria
- La evidencia ya no es opcional.
- Se exige una fotografía antes de completar la misión y avanzar al siguiente día.
- En Android se puede abrir la cámara con “Tomar foto o elegir imagen”.
- La imagen se comprime y guarda localmente en IndexedDB.

### Acceso al Match‑3
- Antes de abrir el reto de bonificación aparece una mini misión:
  **Entrega una distinción neto**.
- También requiere una fotografía obligatoria.
- Una vez validada, desbloquea el Match‑3 correspondiente.

### Preparación para Google Sheets
Cada evidencia guarda:
- `localKey`
- `photoUrl`
- `syncStatus`
- nombre, tipo y tamaño del archivo
- fecha, misión y sucursal

Mientras la app esté publicada únicamente en GitHub Pages, las fotos quedan
guardadas en el dispositivo y `photoUrl` permanece vacío. Para generar una URL
permanente se conectará después un servicio de subida —por ejemplo Google Apps
Script + Google Drive— y esa URL se escribirá en Google Sheets.

La integración futura puede utilizar:
- `window.RetoEvidenceUploader(...)`
- `window.RetoTiburon.getEvidenceQueue()`
- `window.RetoTiburon.getEvidencePhoto(localKey)`
- `window.RetoTiburon.setEvidencePhotoUrl(...)`

## Publicación

1. Descomprime el ZIP.
2. Reemplaza todos los archivos del repositorio.
3. Sube la carpeta `assets` completa.
4. No mezcles V3.3 y V3.4.
5. Abre:

https://christiangh7788-afk.github.io/reto-tiburon/?v=34
