# 🔧 Configuración Rápida de Backups a Google Drive

## ❌ Problema Detectado

Los backups se crean correctamente pero **NO se suben a Google Drive** porque **rclone no está configurado**.

## ✅ Solución en 2 Pasos

### Opción A: Script Automático (RECOMENDADO) ⚡

Ejecuta el script PowerShell que lo hace todo:

```powershell
cd c:\xampp\htdocs\wedding
.\setup-backups-completo.ps1
```

Este script:
1. Verifica que los contenedores estén corriendo
2. Configura rclone interactivamente con Google Drive
3. Ejecuta una prueba de backup
4. Te guía para la configuración final

### Opción B: Manual 🔨

#### Paso 1: Configurar rclone

```powershell
cd c:\xampp\htdocs\wedding\boda-backend
docker compose exec -it app bash scripts/setup-rclone-simple.sh
```

**Durante la configuración:**
- `n` → New remote
- `name>` → **gdrive**
- `Storage>` → **15** (Google Drive) o busca "drive"
- `client_id>` → [ENTER vacío]
- `client_secret>` → [ENTER vacío]
- `scope>` → **1** (Full access)
- `root_folder_id>` → [ENTER vacío]
- `service_account_file>` → [ENTER vacío]
- `Advanced config>` → **n**
- `Use auto config>` → **n** (importante, estamos en servidor sin GUI)

**Te dará un enlace como este:**
```
https://accounts.google.com/o/oauth2/auth?access_type=offline&client_id=...
```

1. Copia el enlace y ábrelo en tu navegador
2. Inicia sesión con: **miwebdebodas.notificacion@gmail.com**
3. Acepta los permisos
4. Copia el código que te da Google
5. Pégalo en la terminal donde dice `Enter verification code>`

- `Keep this remote>` → **y**
- `q` → Quit

#### Paso 2: Probar la conexión

```powershell
docker compose exec app bash scripts/test-rclone-backup.sh
```

Si todo funciona, verás:
```
✅ PRUEBA COMPLETADA CON ÉXITO
```

## 📋 Configuración Final en el Panel Admin

1. Abre: http://localhost:5173/admin/backups
2. Ve a la pestaña **"Configuración"**
3. Configura:
   - **Remote de Google Drive:** `gdrive:/backups-miwebdebodas`
   - **Habilita backups automáticos:** ✅
   - **Días:** Lunes, Miércoles, Viernes (o los que prefieras)
   - **Horarios:** 02:00, 14:00 (ejemplo)
   - **Retención:** 30 días
4. Clic en **"Guardar Configuración"**
5. Prueba con el botón **"Ejecutar Backup"**

## 🔍 Verificar que Funciona

### Opción 1: Desde el contenedor
```powershell
docker compose exec app rclone ls gdrive:/backups-miwebdebodas
```

Deberías ver tus archivos de backup.

### Opción 2: En Google Drive
1. Entra a: https://drive.google.com
2. Inicia sesión con: **miwebdebodas.notificacion@gmail.com**
3. Busca la carpeta: **backups-miwebdebodas**
4. Deberías ver archivos como: `backup_bodas_2026-01-09_17-30-35.tar.gz`

## 🐛 Troubleshooting

### Error: "rclone command not found"
El contenedor necesita tener rclone instalado. Verifica el Dockerfile:
```bash
docker compose exec app which rclone
```

Si no existe, reconstruye el contenedor:
```powershell
docker compose down
docker compose up -d --build
```

### Error: "Failed to configure token"
- Asegúrate de copiar el código completo de Google
- Verifica que inicies sesión con la cuenta correcta
- Intenta de nuevo: `docker compose exec -it app rclone config`

### Error: "403 Forbidden"
Las credenciales de rclone pueden haber expirado. Reconfigura:
```powershell
docker compose exec -it app rclone config delete gdrive
docker compose exec -it app bash scripts/setup-rclone-simple.sh
```

### Los backups siguen sin subirse
Verifica los logs:
```powershell
docker compose exec app php artisan backups:run
docker compose logs app | Select-String "backup"
```

## 📁 Archivos Creados

- `boda-backend/scripts/setup-rclone-simple.sh` - Configurador interactivo
- `boda-backend/scripts/test-rclone-backup.sh` - Script de prueba
- `setup-backups-completo.ps1` - Script PowerShell completo

## 🎯 Resumen

El problema es que **rclone no está configurado** con tu cuenta de Google Drive. 

**Solución rápida:**
```powershell
cd c:\xampp\htdocs\wedding
.\setup-backups-completo.ps1
```

Luego configura el panel admin con: `gdrive:/backups-miwebdebodas`

¡Y listo! 🎉
