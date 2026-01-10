# Guía de Configuración de Backups Automáticos con Google Drive

## 📋 Requisitos Previos

- VPS/Servidor con Docker instalado
- Cuenta de Google Drive
- Acceso SSH al servidor
- La aplicación Laravel está corriendo en contenedor `boda_app`

---

## 🔧 1. Instalación de rclone en el Servidor

El Dockerfile ya incluye `rclone`, pero si necesitas hacerlo manualmente en el servidor:

```bash
# En el servidor (no en Docker)
curl https://rclone.org/install.sh | sudo bash

# Verificar instalación
rclone version
```

---

## 🚀 2. Configurar rclone para Google Drive

### Opción A: Configuración Interactiva en el Servidor

```bash
# Conectarse al contenedor Docker
docker exec -it boda_app bash

# Configurar rclone
rclone config

# En el menú interactivo:
# 1. Presiona 'n' para crear una nueva conexión
# 2. Nombre: gdrive (o el que prefieras)
# 3. Tipo de almacenamiento: Google Drive (opción 18 o similar, busca "drive")
# 4. Google Application Client ID: [Enter para usar el default de rclone]
# 5. Google Application Client Secret: [Enter para usar el default de rclone]
# 6. Scope: Elige "drive" para acceso completo (opción 1)
# 7. Root Folder ID: [Enter para blank]
# 8. Service Account: [Enter para blank]
# 9. Edit advanced config: N
# 10. Use auto config: Y (abrirá navegador o dará código para autorizar)
# 11. Autoriza en Google
# 12. Confirma la configuración
```

### Opción B: Configuración no-interactiva (Para automatización)

Si necesitas automatizar la configuración:

```bash
# Dentro del contenedor
docker exec boda_app rclone config create gdrive drive client_id YOUR_CLIENT_ID client_secret YOUR_CLIENT_SECRET
```

---

## 🔐 3. Configuración almacenada en rclone

Después de configurar, rclone guarda la configuración en:

**Dentro del contenedor:**
```
~/.config/rclone/rclone.conf
```

**En el servidor (si ejecutas desde fuera del contenedor):**
```
/root/.config/rclone/rclone.conf
```

⚠️ **IMPORTANTE**: El contenedor `boda_app` necesita acceso a esta configuración. Esto se logra:

1. Montando el volumen de rclone en el Dockerfile/docker-compose
2. O configurando rclone DENTRO del contenedor (recomendado)

---

## 📁 4. Crear Carpeta en Google Drive

En Google Drive:

1. Abre tu Google Drive
2. Crea una nueva carpeta: `mi-boda` (o el nombre que prefieras)
3. Dentro, crea una subcarpeta: `backups`
4. La ruta será: `gdrive:mi-boda/backups`

Si prefieres usar una unidad compartida o en raíz:
- En raíz: `gdrive:/backups`
- En carpeta específica: `gdrive:Nombre Carpeta/backups`

---

## ✅ 5. Verificar Conexión

### Dentro del contenedor:

```bash
docker exec boda_app bash -c "rclone lsd gdrive:"
```

Deberías ver el listado de carpetas en Google Drive.

### Desde la UI de Admin:

1. Ve a **Admin → Backups → Configuración**
2. Ingresa la ruta: `gdrive:mi-boda/backups`
3. Haz clic en **"Verificar Conexión"**
4. Si es exitosa, verás ✓ mensaje de éxito

---

## 🔄 6. Configurar Backups en la UI

1. **Acceso**: Ve a la sección de Admin → Backups
2. **Habilitar**: Activa el switch "Habilitar Backups Automáticos"
3. **Días**: Selecciona los días de la semana (Ej: Lun, Mié, Vie)
4. **Horas**: Selecciona las horas (Ej: 02:00, 14:30)
5. **Retención**: Días para mantener los backups (Ej: 30 días)
6. **Incluir en backups**: Marca qué elementos incluir:
   - ✓ Base de Datos MySQL
   - ✓ Fotos de Bodas
   - ✓ Tarjetas RSVP
7. **Ruta Drive**: `gdrive:mi-boda/backups`
8. **Guardar**: Haz clic en "Guardar Configuración"

---

## 🎯 7. Ejecutar Backup Manual

En la UI de Admin → Backups:

1. Haz clic en **"▶ Ejecutar Backup Ahora"**
2. El sistema encolará el trabajo en background
3. Verifica en la pestaña **"Historial"** para ver el progreso

---

## 🐛 8. Troubleshooting

### Error: "rclone: command not found"

**Solución**: El contenedor no tiene rclone instalado. Rebuild del Dockerfile:

```bash
cd /ruta/a/boda-backend
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

### Error: "Google Drive connection failed"

**Causas posibles**:

1. **rclone no está configurado**: Ejecuta `rclone config` dentro del contenedor
2. **Credenciales expiradas**: Reconfigura con `rclone config`
3. **Permisos insuficientes**: La carpeta en Google Drive debe existir
4. **Ruta inválida**: Asegúrate que la ruta sea exacta (sensible a mayúsculas)

**Solución**:

```bash
docker exec -it boda_app bash
rclone config
# Vuelve a configurar
rclone lsd gdrive: # Verifica acceso
```

### Error: "mysqldump: command not found"

**Solución**: Ya está incluido en el Dockerfile actualizado. Rebuild:

```bash
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

### Backup se ejecuta pero no sube a Drive

**Causas**:

1. Conexión rclone no verificada
2. Disco lleno en Google Drive
3. Límites de cuota de Google Drive

**Solución**:

- Verifica con: `docker exec boda_app rclone about gdrive:`
- Revisa logs: `docker logs boda_app | grep -i backup`

---

## 📊 9. Monitorear Backups

### Via UI Admin:

- **Historial**: Ver todos los backups ejecutados
- **Estadísticas**: Tasa de éxito, tamaño total, último backup
- **Uso Drive**: Espacio usado/disponible en Google Drive

### Via Terminal:

```bash
# Ver logs del contenedor
docker logs -f boda_app | grep -i backup

# Ejecutar comando manual (en dev)
docker exec boda_app php artisan backups:run --manual

# Ver archivos de backup en el servidor (local)
ls -lh storage/app/backups/ready/

# Listar archivos en Google Drive
docker exec boda_app rclone lsd gdrive:mi-boda/backups
```

---

## 🛡️ 10. Mantenimiento y Limpieza

### Retención Automática

El sistema elimina automáticamente backups antiguos basado en `retention_days`:

- Configuración: `retention_days = 30` (por defecto)
- Se limpian archivos locales y de Drive

### Limpieza Manual

```bash
# Eliminar backup específico de Drive
docker exec boda_app bash -c "rclone delete gdrive:mi-boda/backups/backup_bodas_2026-01-07_02-00-00.tar.gz"

# Listar todos los backups
docker exec boda_app bash -c "rclone ls gdrive:mi-boda/backups"

# Eliminar una carpeta completa
docker exec boda_app bash -c "rclone purge gdrive:mi-boda/backups/old-folder"
```

---

## ⏱️ 11. Cron Job (Scheduler de Laravel)

El sistema usa el **Laravel Scheduler** que se ejecuta cada minuto:

```bash
# En el Dockerfile/entrypoint.sh agregamos:
* * * * * www-data cd /var/www/html && php artisan schedule:run
```

**¿Qué hace?**

Cada minuto verifica si:
- Backups están habilitados
- Hoy es un día programado
- Ahora coincide con una hora programada
- No se ejecutó un backup en el último minuto

Si todo coincide → Dispara el backup automáticamente.

---

## 📝 12. Migraciones y Setup Inicial

```bash
# Ejecutar migraciones (crea las tablas)
docker exec boda_app php artisan migrate

# Crear configuración inicial si no existe
docker exec boda_app php artisan tinker
# Luego en tinker:
App\Models\BackupSetting::settings();
```

---

## 🎓 Resumen Rápido

| Paso | Acción |
|------|--------|
| 1 | Rebuild Dockerfile con `rclone` y `mysqldump` |
| 2 | Ejecutar migraciones: `php artisan migrate` |
| 3 | Configurar rclone: `rclone config` en contenedor |
| 4 | Crear carpeta en Google Drive |
| 5 | UI Admin → Configurar backups + ruta Drive |
| 6 | Click en "Verificar Conexión" |
| 7 | Click en "Ejecutar Backup Ahora" para probar |
| 8 | Ver historial y estadísticas |

---

## 🆘 Soporte Adicional

Si necesitas ayuda:

1. **Logs de aplicación**: `docker logs boda_app`
2. **Logs de base de datos**: `docker logs boda_mysql`
3. **Verificar scheduler**: `docker exec boda_app php artisan schedule:list`
4. **Prueba rclone manualmente**: `docker exec boda_app rclone lsd gdrive:`

---

**Última actualización**: 7 de enero de 2026
