# 🚀 Guía de Despliegue en Producción - Contabo

## ⚠️ Problemas Solucionados

### 1. Error de CORS ✅
- **Problema**: `Access-Control-Allow-Origin` bloqueando peticiones
- **Solución**: Actualizada configuración de CORS en `config/cors.php`
  - `supports_credentials` cambiado a `true`
  - Headers y métodos permitidos correctamente configurados

### 2. Cuenta de Superadministrador ✅
- **Agregado**: Seeder para superadministrador
  - Email: `redy.delgado@gmail.com`
  - Password: `R3DY-ARDOS`

### 3. Formulario de Registro Mejorado ✅
- Campo "repetir contraseña" con validación
- Iconos para mostrar/ocultar contraseñas
- Diseño premium con gradientes
- Validación en tiempo real

### 4. Recuperación de Contraseña ✅
- Endpoint backend: `/api/auth/forgot-password`
- Endpoint backend: `/api/auth/reset-password`
- Página frontend: `/forgot-password`
- Link en página de login

### 5. Spinners en Botones ✅
- Todos los botones importantes tienen spinners de carga
- Usando React Icons (react-icons/fi, react-icons/im)
- Indicadores visuales de estado

## 📋 Pasos de Despliegue

### Paso 1: Conectar al Servidor
```bash
ssh root@161.97.169.31
```

### Paso 2: Navegar al Directorio del Proyecto
```bash
cd /root/wedding/boda-backend
```

### Paso 3: Actualizar Código (Git)
```bash
# Si usas Git
git pull origin main

# O subir archivos manualmente vía SFTP/SCP
```

### Paso 4: Configurar Variables de Entorno
```bash
# Copiar archivo de ejemplo
cp .env.production.example .env

# Editar .env con configuración de producción
nano .env
```

**Variables importantes a configurar:**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=http://161.97.169.31
APP_SERVER_IP=161.97.169.31

DB_HOST=mysql
DB_DATABASE=db_wedding
DB_USERNAME=db_wedding
DB_PASSWORD=secret123

# Configuración de correo (para recuperación de contraseña)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-password-de-aplicacion
MAIL_ENCRYPTION=tls
```

### Paso 5: Ejecutar Script de Despliegue
```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

El script automáticamente:
1. Detiene contenedores actuales
2. Limpia caché de Laravel
3. Actualiza dependencias
4. Configura permisos
5. Levanta contenedores
6. Ejecuta migraciones
7. Ejecuta seeders (incluyendo superadministrador)

### Paso 6: Verificar Servicios
```bash
# Ver estado de contenedores
docker-compose -f docker-compose.prod.yml ps

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f

# Ver logs específicos
docker-compose -f docker-compose.prod.yml logs -f app
docker-compose -f docker-compose.prod.yml logs -f frontend
```

### Paso 7: Verificar Acceso

**URLs:**
- Frontend: http://161.97.169.31
- Backend API: http://161.97.169.31:8000/api
- PHPMyAdmin: http://161.97.169.31:8080

**Credenciales Superadministrador:**
- Email: `redy.delgado@gmail.com`
- Password: `R3DY-ARDOS`

## 🔧 Comandos Útiles

### Reiniciar Servicios
```bash
cd /root/wedding/boda-backend
docker-compose -f docker-compose.prod.yml restart
```

### Ver Logs en Tiempo Real
```bash
docker-compose -f docker-compose.prod.yml logs -f app
```

### Acceder al Contenedor de Laravel
```bash
docker-compose -f docker-compose.prod.yml exec app bash
```

### Limpiar Caché de Laravel
```bash
docker-compose -f docker-compose.prod.yml exec app php artisan cache:clear
docker-compose -f docker-compose.prod.yml exec app php artisan config:clear
docker-compose -f docker-compose.prod.yml exec app php artisan route:clear
docker-compose -f docker-compose.prod.yml exec app php artisan view:clear
```

### Ejecutar Migraciones
```bash
docker-compose -f docker-compose.prod.yml exec app php artisan migrate --force
```

### Ejecutar Seeders
```bash
# Todos los seeders
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force

# Solo superadministrador
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --class=SuperAdminSeeder --force
```

### Crear Usuario Superadministrador Manualmente
Si el seeder no funciona:
```bash
docker-compose -f docker-compose.prod.yml exec app php artisan tinker
```
Luego en tinker:
```php
$rol = App\Models\Role::where('nombre', 'superadmin')->first();
$user = App\Models\User::create([
    'name' => 'Redy Delgado',
    'email' => 'redy.delgado@gmail.com',
    'password' => Hash::make('R3DY-ARDOS'),
    'rol_id' => $rol->id,
    'activo' => true
]);
```

## 🐛 Solución de Problemas

### Error 500 en APIs
```bash
# Ver logs de Laravel
docker-compose -f docker-compose.prod.yml exec app tail -f storage/logs/laravel.log

# Verificar permisos
docker-compose -f docker-compose.prod.yml exec app chmod -R 775 storage bootstrap/cache

# Verificar conexión a base de datos
docker-compose -f docker-compose.prod.yml exec mysql mysql -u db_wedding -psecret123 -e "SHOW DATABASES;"
```

### Error de CORS
Ya está solucionado en el código, pero si persiste:
```bash
# Limpiar caché de configuración
docker-compose -f docker-compose.prod.yml exec app php artisan config:clear
```

### No Aparece el Superadministrador
```bash
# Ejecutar solo el seeder de superadmin
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --class=SuperAdminSeeder --force
```

### Frontend No Carga
```bash
# Verificar que el frontend esté construido con la URL correcta
docker-compose -f docker-compose.prod.yml logs frontend

# Reconstruir frontend
docker-compose -f docker-compose.prod.yml build --no-cache frontend
docker-compose -f docker-compose.prod.yml up -d frontend
```

## 📧 Configuración de Correo

Para que funcione la recuperación de contraseña, necesitas configurar el correo:

### Opción 1: Gmail
1. Crear una "Contraseña de Aplicación" en tu cuenta de Gmail
2. Configurar en `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-password-de-aplicacion
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@miwebdebodas.com"
```

### Opción 2: Mailtrap (Testing)
```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=tu-username-mailtrap
MAIL_PASSWORD=tu-password-mailtrap
```

## ✅ Checklist de Verificación Post-Despliegue

- [ ] Frontend carga correctamente en http://161.97.169.31
- [ ] Backend responde en http://161.97.169.31:8000/api
- [ ] Login funciona correctamente
- [ ] Registro funciona con validación de contraseñas
- [ ] Superadministrador puede iniciar sesión
- [ ] No hay errores de CORS en la consola
- [ ] Los botones muestran spinners al presionarlos
- [ ] Link de "¿Olvidaste tu contraseña?" funciona
- [ ] APIs públicas responden: `/api/public/planes`, `/api/public/plantillas`, `/api/public/faqs`

## 🎯 Próximos Pasos

1. Configurar dominio personalizado (si aplica)
2. Configurar SSL/HTTPS con Let's Encrypt
3. Configurar backups automáticos de base de datos
4. Configurar monitoreo de logs
5. Implementar sistema de notificaciones por email

## 📞 Soporte

Si tienes problemas durante el despliegue:
1. Revisa los logs: `docker-compose -f docker-compose.prod.yml logs -f`
2. Verifica que todos los servicios estén corriendo: `docker-compose -f docker-compose.prod.yml ps`
3. Asegúrate de que el archivo `.env` esté correctamente configurado
