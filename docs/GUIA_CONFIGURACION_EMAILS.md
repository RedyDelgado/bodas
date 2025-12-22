# Guía de Configuración de Emails para Recuperación de Contraseña

## 📧 Resumen

El sistema de recuperación de contraseña ya está completamente implementado con:
- ✅ Interfaz frontend con el estilo de la aplicación (colores slate/gris)
- ✅ Backend Laravel configurado para envío de emails
- ✅ Plantilla HTML personalizada para emails de recuperación
- ✅ Página de reset password con validación

## 🎨 Mejoras Implementadas

### Frontend
- **Página de Forgot Password** actualizada con estilo consistente (slate en lugar de azul/indigo)
- **Página de Reset Password** nueva con:
  - Validación de contraseñas
  - Mostrar/ocultar contraseñas
  - Redirección automática después del reset exitoso
  - Manejo de tokens expirados

### Backend
- **Notificación personalizada** (`ResetPasswordNotification.php`)
- **Plantilla de email HTML** bonita y responsive
- **Integración con modelo User** para enviar notificaciones

## 🔧 Configuración

### 1. Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```env
# URL del frontend para los enlaces de recuperación
FRONTEND_URL=http://localhost:5173

# Configuración de correo
MAIL_MAILER=smtp
MAIL_HOST=mailpit
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS="noreply@miwebdebodas.com"
MAIL_FROM_NAME="MiWebDeBodas"
```

### 2. Desarrollo Local con Mailpit

**Mailpit** ya está incluido en tu `docker-compose.yml`. Para usarlo:

1. Inicia los contenedores Docker:
   ```bash
   docker-compose up -d
   ```

2. Accede a Mailpit en: http://localhost:8025

3. Todos los emails se capturarán aquí (no se enviarán realmente)

### 3. Producción con Gmail

**Correo configurado: miwebdebodas.notificacion@gmail.com**

#### Paso 1: Generar Contraseña de Aplicación

1. Ve a https://myaccount.google.com/security
2. Inicia sesión con **miwebdebodas.notificacion@gmail.com**
3. Activa la **"Verificación en dos pasos"** si no está activada
4. Busca **"Contraseñas de aplicaciones"** (aparece después de activar 2FA)
5. Selecciona:
   - App: **Correo**
   - Dispositivo: **Otro (nombre personalizado)** → Escribe "Laravel MiWebDeBodas"
6. Haz clic en **Generar**
7. **Copia la contraseña de 16 caracteres** (sin espacios)

#### Paso 2: Configurar el .env de Producción

Actualiza tu archivo `.env` con:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=miwebdebodas.notificacion@gmail.com
MAIL_PASSWORD=aqui-tu-contraseña-de-aplicación-de-16-caracteres
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="miwebdebodas.notificacion@gmail.com"
MAIL_FROM_NAME="MiWebDeBodas"
FRONTEND_URL=https://tudominio.com
```

**⚠️ IMPORTANTE**: 
- Usa la **contraseña de aplicación** (16 caracteres), NO tu contraseña normal de Gmail
- No compartas esta contraseña
- Agrega `.env` a tu `.gitignore`

#### Paso 3: (Opcional) Desactivar Recepción de Correos

Si quieres que este correo solo envíe y no reciba:

1. Ve a Gmail → Configuración → Filtros y direcciones bloqueadas
2. Crea un filtro nuevo:
   - **De**: `*`
   - Marca: **"Eliminar"** o **"Archivar automáticamente"**
3. Aplica a todos los correos entrantes

#### Paso 4: Reiniciar el Backend

```bash
# Si usas Docker
docker-compose restart

# O manualmente
php artisan config:clear
php artisan cache:clear
```

### 4. Otras Opciones de Proveedores SMTP

#### SendGrid
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=tu-api-key-de-sendgrid
MAIL_ENCRYPTION=tls
```

#### Mailgun
```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=tu-dominio.mailgun.org
MAILGUN_SECRET=tu-api-key
```

#### Amazon SES
```env
MAIL_MAILER=ses
AWS_ACCESS_KEY_ID=tu-access-key
AWS_SECRET_ACCESS_KEY=tu-secret-key
AWS_DEFAULT_REGION=us-east-1
```

## 🧪 Pruebas

### 1. Probar Localmente

1. Inicia el backend y frontend:
   ```bash
   # Backend
   cd boda-backend
   docker-compose up -d
   
   # Frontend
   cd boda-frontend
   npm run dev
   ```

2. Ve a http://localhost:5173/forgot-password

3. Ingresa un email registrado

4. Revisa el email en http://localhost:8025 (Mailpit)

5. Haz clic en el enlace del email para resetear la contraseña

### 2. Verificar que Funciona

Puedes probar desde la terminal:

```bash
# Dentro del contenedor de Laravel
docker exec -it boda_app php artisan tinker

# Ejecuta:
$user = App\Models\User::first();
$token = Password::createToken($user);
$user->sendPasswordResetNotification($token);
```

Luego verifica en http://localhost:8025

## 📱 Flujo Completo

1. **Usuario olvida contraseña** → Va a `/forgot-password`
2. **Ingresa su email** → Click en "Enviar enlace de recuperación"
3. **Backend genera token** → Guarda en tabla `password_reset_tokens`
4. **Envía email** → Con enlace a `/reset-password?token=...&email=...`
5. **Usuario hace click** → Abre página de reset password
6. **Ingresa nueva contraseña** → Submit del formulario
7. **Backend valida token** → Actualiza contraseña
8. **Redirección automática** → Usuario regresa al login

## 🎨 Personalización del Email

El template está en: `boda-backend/resources/views/emails/reset-password.blade.php`

Puedes personalizarlo cambiando:
- **Colores**: Modifica los valores en el `<style>`
- **Logo**: Agrega un `<img>` en el header
- **Texto**: Edita el contenido HTML
- **Estilos**: Ajusta el CSS inline

## 🔒 Seguridad

- Los tokens expiran en **60 minutos** (configurable en `config/auth.php`)
- Los tokens solo se pueden usar **una vez**
- Los enlaces contienen el email encriptado en la URL
- Las contraseñas se hashean con bcrypt antes de guardarse

## 🐛 Troubleshooting

### "Route [password.reset] not defined"
Este error aparecía porque Laravel buscaba una ruta nombrada. Ya está solucionado con la notificación personalizada que usa la URL del frontend.

### Los emails no llegan
- Verifica que Mailpit esté corriendo: `docker ps | grep mailpit`
- Revisa los logs: `docker logs boda_app`
- Confirma las variables de entorno en `.env`

### Token inválido o expirado
- Los tokens expiran en 60 minutos
- Si cambias el `APP_KEY`, todos los tokens se invalidan
- Verifica que la tabla `password_reset_tokens` exista

## 📝 Archivos Modificados/Creados

### Backend
- `app/Notifications/ResetPasswordNotification.php` (nuevo)
- `app/Models/User.php` (modificado)
- `resources/views/emails/reset-password.blade.php` (nuevo)
- `.env.example` (actualizado)

### Frontend
- `src/features/auth/pages/ForgotPasswordPage.jsx` (estilo actualizado)
- `src/features/auth/pages/ResetPasswordPage.jsx` (nuevo)
- `src/app/router.jsx` (ruta agregada)

## 🚀 Próximos Pasos

1. **Testear en producción** con un proveedor SMTP real
2. **Agregar rate limiting** para prevenir spam
3. **Personalizar más el email** con logo de la marca
4. **Agregar emails de bienvenida** para nuevos usuarios
5. **Implementar verificación de email** para nuevos registros

## 💡 Recomendaciones

- En producción, usa un servicio profesional como SendGrid o Mailgun
- Configura SPF, DKIM y DMARC en tu dominio para mejorar la entrega
- Monitorea las métricas de emails (tasa de apertura, bounces, etc.)
- Mantén actualizada la lista de correos válidos
