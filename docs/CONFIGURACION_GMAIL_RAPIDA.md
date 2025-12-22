# ⚡ Configuración Rápida de Gmail - miwebdebodas.notificacion@gmail.com

## 📋 Checklist de Configuración

### ✅ Paso 1: Generar Contraseña de Aplicación de Google

1. 🔗 Ir a: https://myaccount.google.com/security
2. 👤 Iniciar sesión con: **miwebdebodas.notificacion@gmail.com**
3. 🔐 Activar "Verificación en dos pasos" (si no está activa)
4. 🔑 Buscar "Contraseñas de aplicaciones"
5. ➕ Crear nueva contraseña:
   - **App**: Correo
   - **Dispositivo**: Otro → "Laravel MiWebDeBodas"
6. 📝 **Copiar la contraseña de 16 caracteres** (guárdala de forma segura)

---

## 🔧 Paso 2: Configurar .env del Backend

**Archivo**: `boda-backend/.env`

### Para DESARROLLO LOCAL (usar Mailpit - NO envía emails reales):

```env
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="miwebdebodas.notificacion@gmail.com"
MAIL_FROM_NAME="MiWebDeBodas"
FRONTEND_URL=http://localhost:5173
```

Ver emails en: http://localhost:8025

---

### Para PRODUCCIÓN (envía emails reales con Gmail):

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=miwebdebodas.notificacion@gmail.com
MAIL_PASSWORD=xxxx xxxx xxxx xxxx    # ← Tu contraseña de aplicación de 16 caracteres (sin espacios)
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="miwebdebodas.notificacion@gmail.com"
MAIL_FROM_NAME="MiWebDeBodas"
FRONTEND_URL=https://tudominio.com    # ← Cambiar a tu dominio real
```

---

## 🧪 Paso 3: Probar que Funciona

### Opción A: Desde la Interfaz Web

1. Ir a: http://localhost:5173/forgot-password
2. Ingresar un email registrado
3. Click en "Enviar enlace de recuperación"
4. Revisar:
   - **Desarrollo**: http://localhost:8025 (Mailpit)
   - **Producción**: Bandeja de entrada del email ingresado

### Opción B: Desde Terminal (Laravel Tinker)

```bash
# Entrar al contenedor Docker
docker exec -it boda_app bash

# Abrir Tinker
php artisan tinker

# Ejecutar este código:
$user = App\Models\User::where('email', 'tu-email@ejemplo.com')->first();
$token = Password::createToken($user);
$user->sendPasswordResetNotification($token);

# Salir de Tinker
exit
```

---

## 🔄 Paso 4: Reiniciar Backend (después de cambiar .env)

```bash
# Con Docker
docker-compose restart

# O limpiar cache manualmente
docker exec -it boda_app php artisan config:clear
docker exec -it boda_app php artisan cache:clear
```

---

## 🛡️ Seguridad - IMPORTANTE

### ✅ Hacer:
- ✓ Usar SOLO la contraseña de aplicación (16 caracteres)
- ✓ Agregar `.env` al `.gitignore`
- ✓ NO subir `.env` a GitHub
- ✓ Usar variables de entorno en el servidor

### ❌ NO Hacer:
- ✗ NO usar tu contraseña normal de Gmail
- ✗ NO compartir la contraseña de aplicación
- ✗ NO hacer commit del archivo `.env`

---

## 🚫 (Opcional) Bloquear Correos Entrantes

Si quieres que **miwebdebodas.notificacion@gmail.com** SOLO envíe y NO reciba correos:

1. Ir a: https://mail.google.com/mail/u/0/#settings/filters
2. Crear filtro:
   - **Incluye las palabras**: `*`
   - Acción: Marcar **"Eliminar"** o **"Archivar"**
3. Aplicar a todos los correos futuros

---

## 📊 Verificación Final

- [ ] Contraseña de aplicación generada
- [ ] `.env` configurado con las credenciales correctas
- [ ] Backend reiniciado
- [ ] Email de prueba enviado exitosamente
- [ ] Email recibido correctamente
- [ ] Link de reset password funciona

---

## 🆘 Troubleshooting

### Error: "Invalid credentials" o "Authentication failed"
- ✓ Verifica que usas la **contraseña de aplicación**, no la normal
- ✓ Copia la contraseña sin espacios: `xxxxyyyyzzzzwwww`
- ✓ Verifica que la verificación en dos pasos está activa
- ✓ Reinicia el backend después de cambiar `.env`

### Error: "Connection timeout"
- ✓ Verifica que `MAIL_PORT=587`
- ✓ Verifica que `MAIL_ENCRYPTION=tls`
- ✓ Comprueba tu conexión a internet
- ✓ Verifica que no haya firewall bloqueando el puerto 587

### Los emails no llegan
- ✓ Revisa la carpeta de Spam del destinatario
- ✓ Verifica que `MAIL_FROM_ADDRESS` sea válido
- ✓ Revisa los logs: `docker logs boda_app`
- ✓ Usa Mailpit en desarrollo para debuggear primero

### Error: "Route [password.reset] not defined"
- ✓ Este error ya está solucionado con la notificación personalizada
- ✓ Si persiste, verifica que usas `ResetPasswordNotification` personalizado

---

## 📞 Comandos Útiles

```bash
# Ver logs del backend
docker logs boda_app -f

# Ver configuración de email actual
docker exec -it boda_app php artisan config:show mail

# Limpiar cache de configuración
docker exec -it boda_app php artisan config:clear

# Enviar email de prueba con Tinker
docker exec -it boda_app php artisan tinker
>>> Mail::raw('Test', fn($m) => $m->to('test@example.com')->subject('Test'));

# Revisar cola de emails (si usas queues)
docker exec -it boda_app php artisan queue:work
```

---

## ✅ Todo Listo!

Una vez completados todos los pasos, tu sistema de recuperación de contraseña estará completamente funcional enviando emails reales desde **miwebdebodas.notificacion@gmail.com** 🎉
