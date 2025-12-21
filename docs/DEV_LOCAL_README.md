# 🚀 Desarrollo Local - Guía Rápida

## ⚡ Inicio Rápido

### Opción 1: Script Automático (Recomendado)
```powershell
cd c:\xampp\htdocs\wedding
.\dev-local.ps1
```

### Opción 2: Manual

#### 1. Iniciar Backend (Docker)
```powershell
cd c:\xampp\htdocs\wedding\boda-backend
docker-compose up -d app mysql phpmyadmin
```

#### 2. Iniciar Frontend (Vite Dev)
```powershell
cd c:\xampp\htdocs\wedding\boda-frontend
npm run dev
```

## 🌐 URLs de Desarrollo

- **Frontend**: http://localhost:5173 (Vite con HMR)
- **Backend API**: http://localhost:8000/api
- **PHPMyAdmin**: http://localhost:8080

## 🔑 Credenciales

### Superadministrador
- Email: `redy.delgado@gmail.com`
- Password: `R3DY-ARDOS`

### Base de Datos (PHPMyAdmin)
- Usuario: `db_wedding`
- Password: `secret123`

## ⚙️ Diferencias Local vs Producción

### En Local (Desarrollo)
- ✅ Frontend: Vite dev server con Hot Module Replacement
- ✅ Backend: Docker con volúmenes montados
- ✅ Cambios en código se reflejan instantáneamente
- ✅ Source maps y debugging habilitados

### En Producción
- ✅ Frontend: Build estático servido por Nginx
- ✅ Backend: Docker sin volúmenes
- ✅ Optimizaciones de producción
- ✅ Caché habilitado

## 🛠️ Comandos Útiles

### Detener Todo
```powershell
# Detener backend
cd c:\xampp\htdocs\wedding\boda-backend
docker-compose down

# Detener frontend (Ctrl+C en la terminal donde corre npm)
```

### Reiniciar Backend
```powershell
cd c:\xampp\htdocs\wedding\boda-backend
docker-compose restart app
```

### Ver Logs del Backend
```powershell
docker-compose logs -f app
```

### Limpiar Caché de Laravel
```powershell
docker-compose exec app php artisan cache:clear
docker-compose exec app php artisan config:clear
```

### Crear Superadmin (si no existe)
```powershell
docker-compose exec app php artisan db:seed --class=SuperAdminSeeder
```

### Ejecutar Migraciones
```powershell
docker-compose exec app php artisan migrate
```

### Resetear Base de Datos
```powershell
docker-compose exec app php artisan migrate:fresh --seed
```

## 🐛 Solución de Problemas

### Frontend muestra 404
**Causa:** El frontend está en modo producción (Docker)  
**Solución:**
```powershell
# Detener contenedor de frontend
docker-compose stop frontend

# Iniciar en modo desarrollo
cd c:\xampp\htdocs\wedding\boda-frontend
npm run dev
```

### Error de CORS
**Solución:**
```powershell
docker-compose exec app php artisan config:clear
docker-compose restart app
```

### Puerto 5173 ocupado
**Solución:**
```powershell
# Matar proceso que usa el puerto
Get-Process -Id (Get-NetTCPConnection -LocalPort 5173).OwningProcess | Stop-Process
```

### Backend no responde
**Solución:**
```powershell
docker-compose restart app
docker-compose logs -f app
```

### npm run dev falla
**Solución:**
```powershell
cd c:\xampp\htdocs\wedding\boda-frontend
rm -r node_modules
npm install
npm run dev
```

## 📦 Instalar Dependencias

### Backend (Laravel)
```powershell
docker-compose exec app composer install
```

### Frontend (React + Vite)
```powershell
cd c:\xampp\htdocs\wedding\boda-frontend
npm install
```

## 🔄 Hot Reload

### Frontend
✅ Automático con Vite HMR  
Los cambios en archivos `.jsx`, `.js`, `.css` se reflejan instantáneamente

### Backend
⚠️ Requiere reinicio del contenedor  
```powershell
docker-compose restart app
```

## 🎯 Workflow de Desarrollo

1. **Iniciar servicios**:
   ```powershell
   cd c:\xampp\htdocs\wedding
   .\dev-local.ps1
   ```

2. **Hacer cambios** en el código

3. **Frontend**: Cambios se reflejan automáticamente

4. **Backend**: Si cambias archivos PHP:
   ```powershell
   docker-compose exec app php artisan cache:clear
   ```

5. **Probar** en http://localhost:5173

6. **Commit** cuando todo funcione

## ✅ Checklist Antes de Subir a Producción

- [ ] Todas las funcionalidades probadas en local
- [ ] No hay errores en consola (F12)
- [ ] No hay errores de CORS
- [ ] Login y registro funcionan
- [ ] Validaciones funcionan correctamente
- [ ] Spinners aparecen en botones
- [ ] Diseño se ve correctamente
- [ ] Responsive funciona (mobile/desktop)
- [ ] APIs responden correctamente

## 📚 Próximos Pasos

Una vez que todo funcione en local:

1. **Commit y push** del código
2. **Subir al servidor** (Git o SFTP)
3. **Ejecutar** script de producción:
   ```bash
   ./scripts/deploy-production.sh
   ```
4. **Verificar** en producción

## 💡 Tips

- Usa **dos terminales**: una para backend, otra para frontend
- Mantén los logs abiertos para ver errores en tiempo real
- Usa **React DevTools** para debugging del frontend
- Usa **Laravel Telescope** (opcional) para debugging del backend
- Verifica siempre la consola del navegador (F12)
