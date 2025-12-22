# 🚀 Despliegue a Producción - Sistema de Recuperación de Contraseña

## ✅ Cambios Implementados Listos para Subir a Git

### Backend
- ✅ `app/Notifications/ResetPasswordNotification.php` (nuevo)
- ✅ `app/Models/User.php` (modificado)
- ✅ `resources/views/emails/reset-password.blade.php` (nuevo)
- ✅ `.env.example` (actualizado con configuración de Gmail)

### Frontend
- ✅ `src/features/auth/pages/ForgotPasswordPage.jsx` (estilo actualizado)
- ✅ `src/features/auth/pages/ResetPasswordPage.jsx` (nuevo)
- ✅ `src/app/router.jsx` (ruta agregada)

### Documentación
- ✅ `docs/GUIA_CONFIGURACION_EMAILS.md`
- ✅ `docs/CONFIGURACION_GMAIL_RAPIDA.md`
- ✅ `docs/DESPLIEGUE_EMAILS_PRODUCCION.md` (este archivo)

---

## 📝 PASO 1: Subir Cambios a Git

```powershell
cd c:\xampp\htdocs\wedding

# Ver qué archivos cambiaron
git status

# Agregar todos los cambios (el .env NO se subirá porque está en .gitignore)
git add .

# Commit con mensaje descriptivo
git commit -m "feat: Sistema completo de recuperación de contraseña con emails

- Agregado componente ResetPasswordPage con estilos consistentes
- Actualizado ForgotPasswordPage con diseño mejorado
- Implementada notificación personalizada de email
- Creada plantilla HTML responsive para emails
- Configuración lista para Gmail (miwebdebodas.notificacion@gmail.com)
- Documentación completa de configuración"

# Subir a tu repositorio
git push origin main
# O si tu rama es master: git push origin master
```

---

## 🖥️ PASO 2: Desplegar en el Servidor de Producción

### A. Conectarse al Servidor

```bash
ssh root@161.97.169.31
# O usa tu método de conexión habitual
```

### B. Ir a la Carpeta del Proyecto

```bash
cd /var/www/wedding
# O donde tengas tu proyecto
```

### C. Hacer Pull de los Cambios

```bash
# Hacer backup por si acaso
git stash

# Bajar los cambios
git pull origin main

# Ver qué archivos cambiaron
git log -1 --stat
```

---

## 🔧 PASO 3: Configurar el .env en Producción

**⚠️ IMPORTANTE**: El archivo `.env` NO se sube a Git por seguridad.

### Editar el .env del Backend en el Servidor

```bash
cd /var/www/wedding/boda-backend
nano .env
# O usa: vi .env
```

### Agregar/Modificar estas Variables:

```env
# Configuración de correo con Gmail PRODUCCIÓN
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=miwebdebodas.notificacion@gmail.com
MAIL_PASSWORD=pkjqhkklmjxjtzvc
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="miwebdebodas.notificacion@gmail.com"
MAIL_FROM_NAME="MiWebDeBodas"

# URL del frontend en producción (IMPORTANTE - cambiar a tu dominio real)
FRONTEND_URL=https://161.97.169.31
# O si tienes dominio: FRONTEND_URL=https://tudominio.com
```

**Guardar**: 
- Nano: `Ctrl + O` → Enter → `Ctrl + X`
- Vi: `Esc` → `:wq` → Enter

---

## 🔄 PASO 4: Reiniciar Servicios en Producción

### Si usas Docker:

```bash
cd /var/www/wedding/boda-backend
docker-compose restart

# O solo el backend
docker-compose restart app
```

### Si NO usas Docker:

```bash
# Limpiar cache de Laravel
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Reiniciar servicios
sudo systemctl restart php8.2-fpm
sudo systemctl restart nginx
```

---

## 🧪 PASO 5: Probar en Producción

### Opción A: Desde la Web

1. Ve a: `https://161.97.169.31/forgot-password`
2. Ingresa un email válido registrado
3. Click en "Enviar enlace de recuperación"
4. Revisa la bandeja de entrada del email
5. Haz click en el enlace del email
6. Ingresa la nueva contraseña
7. Verifica que puedas iniciar sesión con la nueva contraseña

### Opción B: Desde Terminal en el Servidor

```bash
# Entrar al contenedor (si usas Docker)
docker exec -it boda_app bash

# O directamente si no usas Docker
php artisan tinker

# Ejecutar:
$user = App\Models\User::where('email', 'paticuadros28@gmail.com')->first();
$token = Password::createToken($user);
$user->sendPasswordResetNotification($token);
exit
```

Luego revisa el email.

---

## 🔍 PASO 6: Verificar Logs (si hay problemas)

```bash
# Ver logs del backend
docker logs boda_app -f

# O ver el archivo de logs directamente
tail -f /var/www/wedding/boda-backend/storage/logs/laravel.log

# Ver logs de Nginx
tail -f /var/log/nginx/error.log
```

---

## 🐛 Troubleshooting en Producción

### Error: "Invalid credentials"

```bash
# Verificar configuración actual
docker exec -it boda_app php artisan config:show mail

# Si no muestra los valores correctos
docker exec -it boda_app php artisan config:clear
docker-compose restart app
```

### Error: "Connection refused" o Timeout

```bash
# Verificar que el puerto 587 esté abierto
telnet smtp.gmail.com 587

# Verificar firewall
sudo ufw status
sudo ufw allow 587/tcp

# Verificar DNS
nslookup smtp.gmail.com
```

### Los emails no llegan

1. Revisa carpeta de Spam del destinatario
2. Verifica los logs: `docker logs boda_app`
3. Comprueba que `FRONTEND_URL` sea correcto
4. Verifica que la contraseña de Gmail sea correcta (sin espacios)

### Error: "CSRF token mismatch"

```bash
# Limpiar sesiones y cache
docker exec -it boda_app php artisan cache:clear
docker exec -it boda_app php artisan config:clear
```

---

## 📊 Checklist Final de Producción

- [ ] Código subido a Git
- [ ] Pull realizado en el servidor
- [ ] `.env` configurado con credenciales de Gmail
- [ ] `FRONTEND_URL` apunta al dominio/IP de producción
- [ ] Backend reiniciado
- [ ] Email de prueba enviado exitosamente
- [ ] Email recibido correctamente
- [ ] Link de reset funciona
- [ ] Usuario puede iniciar sesión con nueva contraseña
- [ ] Logs revisados sin errores

---

## 🔒 Seguridad - Recordatorios

### ✅ Hacer:
- ✓ Configurar `.env` directamente en el servidor
- ✓ Usar HTTPS en producción (`FRONTEND_URL=https://...`)
- ✓ Verificar que `.env` tenga permisos 600: `chmod 600 .env`
- ✓ Hacer backup del `.env` en lugar seguro
- ✓ Usar variables de entorno del servidor si es posible

### ❌ NO Hacer:
- ✗ NO subir `.env` a Git
- ✗ NO compartir la contraseña de aplicación
- ✗ NO usar HTTP en producción para páginas sensibles
- ✗ NO dejar `.env` con permisos públicos

---

## 📧 Información de Email Configurada

- **Correo**: miwebdebodas.notificacion@gmail.com
- **Contraseña**: pkjqhkklmjxjtzvc (Contraseña de aplicación)
- **Nombre**: Laravel MiWebDeBodas
- **Uso**: Solo envío de emails automáticos

---

## 🎯 URLs Importantes en Producción

```bash
# Frontend
https://161.97.169.31/forgot-password
https://161.97.169.31/reset-password?token=...&email=...

# Backend API
https://161.97.169.31/api/auth/forgot-password
https://161.97.169.31/api/auth/reset-password
```

---

## 📞 Comandos Útiles para Mantenimiento

```bash
# Ver configuración de email actual
docker exec -it boda_app php artisan config:show mail

# Probar envío de email
docker exec -it boda_app php artisan tinker
>>> Mail::raw('Prueba', fn($m) => $m->to('test@example.com')->subject('Test'));

# Ver usuarios registrados
docker exec -it boda_app php artisan tinker
>>> User::select('id', 'name', 'email')->get();

# Limpiar tokens de password expirados (opcional)
docker exec -it boda_app php artisan tinker
>>> DB::table('password_reset_tokens')->where('created_at', '<', now()->subHours(2))->delete();

# Monitorear logs en tiempo real
docker logs boda_app -f --tail 100
```

---

## ✅ ¡Todo Listo!

Una vez completados todos los pasos, tu sistema de recuperación de contraseña estará funcionando en producción enviando emails reales desde **miwebdebodas.notificacion@gmail.com** 🎉

### Próximos Pasos Opcionales:

1. **Configurar SPF/DKIM** en tu dominio para mejorar deliverability
2. **Agregar rate limiting** en las rutas de password reset
3. **Implementar logging** de emails enviados
4. **Agregar notificaciones** por email para otros eventos (registro, cambios, etc.)
