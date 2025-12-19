Instrucciones rápidas para descargar la fuente usada por `PublicRsvpCardController`

1) Desde PowerShell (en Windows), sitúate en la carpeta `boda-backend` y ejecuta:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\download-font.ps1
```

2) El script intentará descargar `DejaVuSans.ttf` desde el repositorio público y lo guardará como:

  `boda-backend/public/fonts/CormorantGaramond-SemiBold.ttf`

   Esto satisface la comprobación que hace el controlador y permite generar la tarjeta.

3) Si tu servidor corre en Docker, ejecuta el script en el contenedor PHP (o copia el archivo resultante desde el host al contenedor) y asegúrate de reiniciar el servicio PHP-FPM/contendedor si es necesario.

4) Comprobaciones adicionales si sigue fallando:
- Verifica que `boda-backend/public/fonts/CormorantGaramond-SemiBold.ttf` existe y es legible por el proceso web.
- Ejecuta:

```powershell
php artisan config:clear
php artisan cache:clear
```

- Si usas contenedores, copia el archivo dentro del contenedor:

```bash
# ejemplo (ajusta nombre del contenedor):
docker cp .\public\fonts\CormorantGaramond-SemiBold.ttf <php-container>:/var/www/html/public/fonts/CormorantGaramond-SemiBold.ttf
```

5) Si no quieres usar este script, también puedes colocar cualquier TTF en `public/fonts/` y renombrarlo a `CormorantGaramond-SemiBold.ttf`.
