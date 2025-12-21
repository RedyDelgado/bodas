# 🚀 Despliegue Rápido - Producción

## ⚡ Inicio Rápido

```bash
# Conectar al servidor
ssh root@161.97.169.31

# Navegar al proyecto
cd /root/wedding/boda-backend

# Ejecutar despliegue automático
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

## ✅ Verificación del Sistema

```bash
# Verificar todo el sistema
chmod +x scripts/verify-system.sh
./scripts/verify-system.sh
```

## 🔧 Comandos Rápidos

```bash
# Menú interactivo
chmod +x scripts/quick-commands.sh
./scripts/quick-commands.sh
```

## 📊 URLs de Acceso

- **Frontend**: http://161.97.169.31
- **Backend API**: http://161.97.169.31:8000/api
- **PHPMyAdmin**: http://161.97.169.31:8080

## 🔑 Credenciales

### Superadministrador
- Email: `redy.delgado@gmail.com`
- Password: `R3DY-ARDOS`

### Base de Datos (PHPMyAdmin)
- Usuario: `db_wedding`
- Password: `secret123`

## 🆘 Solución Rápida de Problemas

### Error de CORS
```bash
docker-compose -f docker-compose.prod.yml exec app php artisan config:clear
docker-compose -f docker-compose.prod.yml restart
```

### Error 500 en APIs
```bash
# Ver logs
docker-compose -f docker-compose.prod.yml logs -f app

# Ejecutar seeders si faltan datos
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --force
```

### Crear Superadministrador
```bash
docker-compose -f docker-compose.prod.yml exec app php artisan db:seed --class=SuperAdminSeeder --force
```

### Limpiar Caché
```bash
docker-compose -f docker-compose.prod.yml exec app php artisan cache:clear
docker-compose -f docker-compose.prod.yml exec app php artisan config:clear
```

### Reiniciar Todo
```bash
docker-compose -f docker-compose.prod.yml restart
```

## 📖 Documentación Completa

Ver: `GUIA_DESPLIEGUE_PRODUCCION_COMPLETA.md`

## ✨ Mejoras Implementadas

- ✅ CORS configurado correctamente
- ✅ Superadministrador auto-creado
- ✅ Formulario de registro premium con validación
- ✅ Recuperación de contraseña
- ✅ Spinners en todos los botones
- ✅ Diseño mejorado con gradientes

Ver detalles en: `RESUMEN_MEJORAS_IMPLEMENTADAS.md`
