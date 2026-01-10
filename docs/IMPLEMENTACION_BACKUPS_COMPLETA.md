# MÓDULO DE BACKUPS AUTOMÁTICOS - IMPLEMENTACIÓN COMPLETA

## ✨ Qué se ha implementado

Un sistema robusto de backups automáticos con:

### ✅ Backend (Laravel)
- **Base de Datos**: 2 nuevas tablas (`backup_settings`, `backup_runs`)
- **Modelos**: `BackupSetting`, `BackupRun` con métodos útiles
- **Servicio**: `BackupService` con toda la lógica (dump, compresión, upload)
- **Job**: `RunBackupJob` con mutex para evitar ejecuciones paralelas
- **Command**: `backups:run` para ejecutar manualmente
- **Scheduler**: Cada minuto verifica si toca ejecutar backup
- **Controlador API**: `BackupController` con 9 endpoints
- **Rutas**: `/api/admin/backups/*` protegidas con autenticación

### ✅ Frontend (React)
- **Componente**: `BackupAdmin.jsx` con 3 pestañas:
  - **Configuración**: Habilitar, días, horas, retención, qué incluir, ruta Drive
  - **Historial**: Tabla con todos los backups ejecutados
  - **Estadísticas**: Gráficas, tasas de éxito, uso de Drive

### ✅ Docker
- **Dockerfile**: Agreg mysqldump, rclone, cron
- **Entrypoint**: Script que inicia cron + Laravel scheduler
- **NO modificado**: docker-compose.yml (cero cambios en configuración)

### ✅ Documentación
- **GUIA_BACKUPS_AUTOMATICOS.md**: Pasos completos de setup rclone

---

## 🚀 Pasos para Activar

### 1. Actualizar Dockerfile y Hacer Rebuild

```bash
cd boda-backend
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

### 2. Ejecutar Migraciones

```bash
docker exec boda_app php artisan migrate
```

Esto crea las tablas `backup_settings` y `backup_runs`.

### 3. Configurar rclone para Google Drive

```bash
docker exec -it boda_app bash
rclone config
# Sigue los pasos en GUIA_BACKUPS_AUTOMATICOS.md
```

### 4. Acceder a la UI Admin

1. Inicia sesión como Admin General
2. Ve a **Admin → Backups** (o según tu routing)
3. Configura:
   - Habilitar backups ✓
   - Días (Ej: Lun, Mié, Vie)
   - Horas (Ej: 02:00, 14:30)
   - Retención (30 días)
   - Qué incluir (BD, fotos, tarjetas)
   - Ruta Drive (gdrive:mi-boda/backups)
4. Click en "Verificar Conexión" ✓
5. Click en "Guardar Configuración" ✓

### 5. Probar Manualmente

En la UI:
- Click en **"▶ Ejecutar Backup Ahora"**
- Va a pestaña "Historial" para ver el progreso
- Debería completarse en 5-10 minutos (depende del tamaño)

---

## 📊 Arquitectura de Archivos

```
boda-backend/
├── app/
│   ├── Models/
│   │   ├── BackupSetting.php         ← Modelo de configuración
│   │   └── BackupRun.php             ← Modelo de ejecuciones
│   ├── Services/
│   │   └── BackupService.php         ← Lógica principal (150+ líneas)
│   ├── Jobs/
│   │   └── RunBackupJob.php          ← Job de cola
│   ├── Console/
│   │   ├── Kernel.php                ← SCHEDULER (MODIFICADO)
│   │   └── Commands/
│   │       └── BackupsRunCommand.php ← Artisan command
│   └── Http/
│       └── Controllers/
│           └── Admin/
│               └── BackupController.php ← API endpoints (9 métodos)
├── database/
│   └── migrations/
│       ├── 2026_01_07_000001_create_backup_settings_table.php
│       └── 2026_01_07_000002_create_backup_runs_table.php
├── docker/
│   └── entrypoint.sh                 ← Script startup (NUEVO)
├── Dockerfile                         ← MODIFICADO (mysqldump, rclone, cron)
└── routes/
    └── api.php                        ← MODIFICADO (agregadas rutas /admin/backups)

boda-frontend/
└── src/
    └── components/
        └── Admin/
            └── BackupAdmin.jsx       ← Componente React (3 tabs)

docs/
└── GUIA_BACKUPS_AUTOMATICOS.md       ← Documentación completa
```

---

## 🔄 Flujo de Ejecución

```
1. CADA MINUTO:
   ├─ Laravel Scheduler corre (cron en Dockerfile)
   └─ Kernel.php checkAndRunBackup() revisa:
      ├─ ¿Habilitado en settings?
      ├─ ¿Es un día programado?
      ├─ ¿Es una hora programada?
      └─ ✓ Dispara RunBackupJob

2. DENTRO DEL JOB:
   ├─ Adquiere LOCK (mutex) para evitar paralelos
   ├─ Llama BackupService::runFullBackup()
   │  ├─ mysqldump → db_wedding.sql
   │  ├─ tar -czf fotos_boda + tarjetas
   │  ├─ tar -czf everything.tar.gz
   │  ├─ hash sha256
   │  ├─ rclone copy → Google Drive
   │  └─ Limpiar archivos antiguos
   ├─ Actualiza BackupRun con resultado (success/failed)
   └─ Libera LOCK

3. UI ADMIN VE:
   ├─ Historial actualizado
   ├─ Estadísticas recalculadas
   └─ Botones "Ejecutar Ahora" y "Reintentar"
```

---

## 🔐 Seguridad & Validaciones

✅ **Mutex/Lock**: Evita 2 backups simultáneos  
✅ **Validación**: schedule_days/times en BD, verificación Drive  
✅ **Error Handling**: Toda excepción se registra en `error_message`  
✅ **Retención**: Limpia automáticamente backups antiguos (30 días default)  
✅ **Sin contraseñas**: rclone auth se configura AFUERA de Laravel  
✅ **Sin correos**: Solo logs en BD, sin notificaciones  
✅ **No encriptado**: Por simplicidad (se puede agregar después)  

---

## 📈 Monitoreo

### Desde la UI:

**Pestaña Estadísticas:**
- Total de backups: X
- Tasa de éxito: X%
- Último backup exitoso: fecha/hora
- Tamaño acumulado: X GB
- Uso de Google Drive: X% (con barra de progreso)

**Pestaña Historial:**
- Tabla con todos los backups
- Estado (queued, running, success, failed)
- Archivo, tamaño, duración
- Si subió a Drive

### Desde Terminal:

```bash
# Ver logs
docker logs -f boda_app | grep -i backup

# Listar backups en Drive
docker exec boda_app rclone ls gdrive:mi-boda/backups

# Ver configuración guardada
docker exec boda_app php artisan tinker
# > App\Models\BackupSetting::settings()
```

---

## ❓ FAQ

### P: ¿Qué pasa si falla la subida a Drive?

R: El archivo se mantiene local por 24h (o según retención). El status es "failed" en la BD. Puedes hacer clic en "Reintentar" en la UI.

### P: ¿Se envían correos de notificación?

R: NO. Solo se registran en BD y permiten ver historial en UI.

### P: ¿Puedo cambiar la programación mientras está en marcha?

R: SÍ. El scheduler verifica settings cada minuto, así que los cambios aplican inmediatamente.

### P: ¿Dónde se guarda la configuración de rclone?

R: En el contenedor, en `~/.config/rclone/rclone.conf` (home del usuario www-data).

### P: ¿Se pueden ejecutar 2 backups a la vez?

R: NO. El Job usa `Cache::put('backup_running', true)` por 2 horas para lockear.

### P: ¿Qué tamaño máximo puede tener un backup?

R: Sin límite por defecto. Puedes agregar `max_backup_size_mb` en settings para validar.

### P: ¿Cómo restauro desde un backup?

R: Los archivos están en Google Drive o locales. Manualmente se descargan y se restauran con `mysql < dump.sql`.

---

## 🛠️ Próximas Mejoras (Opcionales)

- [ ] Compresión con encriptación (openssl)
- [ ] Restauración automática desde UI
- [ ] Webhooks/notificaciones Slack
- [ ] Validación de integridad (test restore)
- [ ] Backups incremental
- [ ] Multi-destino (AWS S3, Backblaze, etc)

---

## 📝 Archivos Modificados

```
CREADOS:
  ✓ app/Models/BackupSetting.php
  ✓ app/Models/BackupRun.php
  ✓ app/Services/BackupService.php
  ✓ app/Jobs/RunBackupJob.php
  ✓ app/Console/Commands/BackupsRunCommand.php
  ✓ app/Http/Controllers/Admin/BackupController.php
  ✓ database/migrations/2026_01_07_000001_create_backup_settings_table.php
  ✓ database/migrations/2026_01_07_000002_create_backup_runs_table.php
  ✓ docker/entrypoint.sh
  ✓ boda-frontend/src/components/Admin/BackupAdmin.jsx
  ✓ docs/GUIA_BACKUPS_AUTOMATICOS.md

MODIFICADOS:
  ✓ Dockerfile (agregadas: mysql-client, rclone, cron + entrypoint)
  ✓ app/Console/Kernel.php (agregado scheduler completo)
  ✓ routes/api.php (agregadas 9 rutas /admin/backups)

SIN CAMBIOS:
  ✓ docker-compose.yml
  ✓ docker-compose.dev.yml
  ✓ .env (no necesita cambios)
```

---

## 🎓 Notas Técnicas

### Porque NO se modificó docker-compose

El scheduler de Laravel ya tiene todo integrado. Solo necesitamos:

1. `php artisan schedule:run` ejecutándose cada minuto (via cron en Dockerfile) ✓
2. Acceso a mysqldump (instalado en Dockerfile) ✓
3. rclone (instalado en Dockerfile) ✓

El docker-compose original sigue funcionando tal cual.

### Por qué usar Cache::put para mutex

- Más simple que database locks
- Compatible con cualquier cache driver (Redis, File, DB)
- Por defecto usa el file cache del servidor
- Automáticamente se limpia con TTL

### Timezone

Por defecto: `America/Lima`. Se puede cambiar desde UI en settings.

---

**Implementación completada: 7 de enero de 2026**
