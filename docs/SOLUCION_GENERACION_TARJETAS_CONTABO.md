# 🔧 SOLUCIÓN: Generación de Tarjetas Atascada en Contabo

## 🚨 El Problema

Cuando intentas generar tarjetas en producción (Contabo), el modal queda en **"Generando tarjetas"** con progreso **0/90** y nunca avanza.

```
Estado: En cola...
Progreso: 0/90 ❌
```

### ¿Por qué sucede?

Tu servidor en Contabo tiene:
- ✅ `QUEUE_CONNECTION=database` (configurado en `.env`)
- ❌ **PERO NO HAY WORKER ESCUCHANDO** (`php artisan queue:work`)

Esto significa:
1. El API recibe la solicitud de generar
2. **Inserta un job en la tabla `jobs`** ✓
3. Dice "está en proceso" ✓
4. **Pero NADIE ejecuta ese job** ❌
5. El job se queda en la cola para siempre

---

## ✅ SOLUCIONES (Elige una)

### **OPCIÓN 1: Usar Queue Sincronizadas (RECOMENDADO PARA CONTABO) ⭐**

La forma más simple sin necesidad de un worker permanente.

#### Paso 1: Actualizar `.env` en Contabo

En tu servidor, edita el archivo `.env`:

```bash
# SSH a tu servidor
ssh root@161.97.169.31

# Editar .env en el directorio del backend
nano /ruta/a/boda-backend/.env
```

Cambia esta línea:
```env
# ANTES:
QUEUE_CONNECTION=database

# DESPUÉS:
QUEUE_CONNECTION=sync
```

#### Paso 2: Recargar la aplicación

```bash
# Si estás usando Docker:
docker compose restart app

# O si es directo en el servidor:
php artisan config:cache
```

#### ✅ Resultado
- Las tarjetas se generan **inmediatamente** cuando das click
- **NO necesitas worker permanente**
- El progreso avanza en tiempo real
- ⚠️ Puede tomar 30-60 segundos (depende de cantidad de invitados)

---

### **OPCIÓN 2: Configurar un Worker Permanente (IDEAL A LARGO PLAZO)**

Si quieres procesamiento asincrónico verdadero:

#### Paso 1: Instalar Supervisor

```bash
# En tu servidor Contabo
apt-get update
apt-get install supervisor
```

#### Paso 2: Crear archivo de configuración

```bash
nano /etc/supervisor/conf.d/laravel-worker.conf
```

Pega este contenido (ajusta rutas según tu setup):

```ini
[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /ruta/a/boda-backend/artisan queue:work database --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasgroup=true
stopwaitsecs=60
numprocs=4
redirect_stderr=true
stdout_logfile=/ruta/a/boda-backend/storage/logs/worker.log
environment=PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",HOME="/root",LOGNAME="root"
```

#### Paso 3: Activar Supervisor

```bash
supervisorctl reread
supervisorctl update
supervisorctl start laravel-worker:*
supervisorctl status
```

#### Paso 4: Asegurarse de que se reinicia con el servidor

```bash
systemctl enable supervisor
systemctl restart supervisor
```

---

### **OPCIÓN 3: Usar un Cron Job (ALTERNATIVA SIMPLE)**

Si no quieres instalar Supervisor:

```bash
# Agregar a crontab
crontab -e
```

Añade esta línea:

```cron
* * * * * cd /ruta/a/boda-backend && php artisan queue:work database --max-jobs=1000 --max-time=3600 > /dev/null 2>&1
```

Esto ejecutará el worker cada minuto y procesará hasta 1000 jobs o 1 hora.

---

## 🧪 PRUEBA QUE FUNCIONA

1. **Abre tu panel de invitados** en producción
2. **Click en "Regenerar tarjetas"**
3. El modal debe mostrar **progreso incrementándose** (0, 1, 2, 3...)
4. **Debería completar en 30-120 segundos** (depende de cantidad de invitados)

### Verificar en logs

Si usas Docker:
```bash
docker compose logs -f app | grep "CardDesigner"
```

Si es servidor directo:
```bash
tail -f /ruta/a/boda-backend/storage/logs/laravel.log | grep "CardDesigner"
```

Deberías ver algo como:
```
[2026-01-11] CardDesigner: ejecutando tarjetas sincronizadamente
[2026-01-11] CardDesigner: generación sincrónica completada
```

---

## 📋 CHECKLIST RÁPIDO

- [ ] Editar `.env`: cambiar `QUEUE_CONNECTION=database` → `QUEUE_CONNECTION=sync`
- [ ] Hacer deploy de los cambios
- [ ] Reiniciar el contenedor/aplicación
- [ ] Probar generación de 1-2 tarjetas
- [ ] Probar generación de todas las tarjetas

---

## 🆘 Si sigue sin funcionar

### Verifica estos puntos:

#### 1. ¿El `.env` tiene los cambios?
```bash
grep QUEUE_CONNECTION /ruta/a/boda-backend/.env
```

Debe mostrar: `QUEUE_CONNECTION=sync`

#### 2. ¿Laravel está usando la configuración correcta?
```bash
php artisan config:show queue.default
```

Debe mostrar: `sync`

#### 3. ¿Hay suficiente espacio de almacenamiento?
```bash
df -h
```

Las tarjetas necesitan espacio en `/storage/app/public/tarjetas`

#### 4. ¿Los permisos están correctos?
```bash
chmod -R 775 /ruta/a/boda-backend/storage
chmod -R 775 /ruta/a/boda-backend/public
```

#### 5. ¿Revisar los logs de errores?
```bash
tail -f /ruta/a/boda-backend/storage/logs/laravel.log
```

Busca líneas con `ERROR` o `Exception`

---

## 📊 Comparativa de Opciones

| Opción | Instalación | Tiempo | Escalabilidad | Recomendado |
|--------|-------------|--------|---------------|-------------|
| **Sync (Opción 1)** | ⚡ Inmediata | 30-60s | ❌ No | ✅ Contabo pequeño |
| **Supervisor (Opción 2)** | 📦 Instalación | <5s | ✅ Sí | ✅ Contabo grande |
| **Cron (Opción 3)** | 📝 1 línea | 30-60s | ⚠️ Limitada | ✅ Prueba rápida |

---

## 💡 NOTA IMPORTANTE

**Este problema se ha resuelto en el código.**

Ahora el sistema:
1. **Detecta automáticamente** si hay worker escuchando
2. **Si NO hay worker** → Ejecuta sincronizadamente (Opción 1)
3. **Si SÍ hay worker** → Usa la cola (Opción 2)

✅ **Funciona en ambos casos**, sin necesidad de cambios en el código de la aplicación.

---

**¿Necesitas ayuda?** Revisa los logs o contacta al soporte de Contabo para asistencia con Supervisor.
