# 🚀 Guía de Despliegue en Contabo - Producción

**Proyecto:** Sistema de Gestión de Bodas (Frontend React + Backend Laravel + Traefik + MySQL)  
**Servidor:** Contabo VPS  
**Stack:** Docker Compose, Traefik, Nginx, PHP 8.2, MySQL 8.0

---

## 📋 Requisitos Previos

- ✅ Cuenta activa en Contabo con VPS contratado
- ✅ Acceso SSH al servidor (usuario root o sudo)
- ✅ IP pública asignada (la proporcionará Contabo)
- ✅ Opcional: Dominio base para subdominios (ej. `miwebdebodas.com`)
- ✅ Git, Docker y Docker Compose instalados en el servidor

---

## 🔧 1. Configuración Inicial del Servidor

### 1.1. Conectar por SSH

```bash
ssh root@TU_IP_DE_CONTABO
# O si tienes usuario con sudo:
ssh tu_usuario@TU_IP_DE_CONTABO
```

### 1.2. Actualizar el Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.3. Instalar Docker y Docker Compose

```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Iniciar Docker y habilitarlo al arranque
sudo systemctl start docker
sudo systemctl enable docker

# Verificar instalación
docker --version
docker compose version

# Opcional: agregar tu usuario al grupo docker para no usar sudo
sudo usermod -aG docker $USER
# Cierra sesión y vuelve a entrar para aplicar cambios
```

### 1.4. Instalar Git

```bash
sudo apt install git -y
git --version
```

### 1.5. Configurar Firewall (UFW)

```bash
# Habilitar firewall
sudo ufw enable

# Permitir SSH (importante, antes de habilitar)
sudo ufw allow 22/tcp

# Permitir HTTP y HTTPS (Traefik)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Ver estado
sudo ufw status
```

---

## 📦 2. Clonar el Proyecto

### 2.1. Crear Directorio de Trabajo

```bash
cd /opt
sudo mkdir -p wedding
sudo chown $USER:$USER wedding
cd wedding
```

### 2.2. Clonar desde Git (o subir archivos)

**Opción A: Clonar repositorio**
```bash
git clone https://github.com/TU_USUARIO/TU_REPO.git .
```

**Opción B: Subir archivos con SCP desde tu máquina local**
```powershell
# Desde tu PC Windows (PowerShell)
scp -r C:\xampp\htdocs\wedding\* root@TU_IP_DE_CONTABO:/opt/wedding/
```

**Opción C: Subir con SFTP (FileZilla, WinSCP)**
- Conecta a `TU_IP_DE_CONTABO` puerto 22
- Sube `boda-backend/` y `boda-frontend/` a `/opt/wedding/`

---

## ⚙️ 3. Configuración del Backend

### 3.1. Configurar .env de Laravel

```bash
cd /opt/wedding/boda-backend
cp .env.example .env
nano .env  # O usa vim, vi, etc.
```

**Variables clave a configurar:**

```env
APP_NAME="MiWebDeBodas"
APP_ENV=production
APP_KEY=  # Se generará después
APP_DEBUG=false
APP_URL=https://TU_IP_O_DOMINIO

# Dominio base para subdominios (si usarás subdominios)
APP_BODAS_BASE_DOMAIN=miwebdebodas.com

# IP del servidor (para verificación DNS)
APP_SERVER_IP=TU_IP_PUBLICA

# Base de datos (debe coincidir con docker-compose.yml)
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=db_wedding
DB_USERNAME=db_wedding
DB_PASSWORD=secret123  # CAMBIA ESTO A ALGO SEGURO

# Queue (para jobs de generación de tarjetas)
QUEUE_CONNECTION=database

# Traefik / Let's Encrypt
TRAEFIK_ACME_EMAIL=tu@email.com

# CORS (opcional, si frontend está en otro dominio)
# Con Traefik en mismo host no es necesario
```

**💡 Importante:** Cambia `DB_PASSWORD` y `MYSQL_ROOT_PASSWORD` en producción.

### 3.2. Configurar docker-compose.yml

Edita `/opt/wedding/boda-backend/docker-compose.yml` y ajusta:

```yaml
# Asegúrate que TRAEFIK_ACME_EMAIL esté correctamente configurado
services:
  traefik:
    environment:
      - TRAEFIK_ACME_EMAIL=${TRAEFIK_ACME_EMAIL:-tu@email.com}
```

---

## 🎨 4. Configuración del Frontend

No es necesario crear `.env` en frontend porque las variables se inyectan durante el build con Docker.

El `docker-compose.yml` ya tiene:
```yaml
args:
  VITE_API_URL: "/api"
  VITE_USE_FAKE: "false"
```

Esto hace que el frontend llame a `/api` en el mismo dominio (sin CORS).

---

## 🚢 5. Build y Despliegue

### 5.1. Construir Imágenes

```bash
cd /opt/wedding/boda-backend
docker compose build
```

Esto tomará varios minutos la primera vez (descarga imágenes base, instala dependencias Node/Composer, etc.).

### 5.2. Iniciar Servicios

```bash
docker compose up -d
```

**Servicios levantados:**
- `boda_traefik` → Reverse proxy (puertos 80, 443)
- `boda_app` → Backend Laravel
- `boda_frontend` → Frontend React + Nginx
- `boda_mysql` → Base de datos MySQL
- `boda_phpmyadmin` → Gestor DB (puerto 8080)

### 5.3. Verificar Estado

```bash
docker compose ps
docker compose logs -f traefik  # Ver logs de Traefik
docker compose logs -f app      # Ver logs del backend
docker compose logs -f frontend # Ver logs del frontend
```

### 5.4. Generar APP_KEY de Laravel

```bash
docker compose exec app php artisan key:generate
```

Esto actualizará automáticamente el `.env` dentro del contenedor.

### 5.5. Ejecutar Migraciones

```bash
docker compose exec app php artisan migrate --force
```

### 5.6. Crear Storage Link

```bash
docker compose exec app php artisan storage:link
```

### 5.7. Cachear Configuración (opcional, mejora performance)

```bash
docker compose exec app php artisan config:cache
docker compose exec app php artisan route:cache
docker compose exec app php artisan view:cache
```

---

## 🌐 6. Configuración DNS y Dominios

### 6.1. Acceso Inicial por IP

Abre tu navegador y ve a:
- Frontend: `http://TU_IP_DE_CONTABO/`
- phpMyAdmin: `http://TU_IP_DE_CONTABO:8080`

**⚠️ HTTPS con IP no funciona** porque Let's Encrypt requiere un dominio válido.

### 6.2. Configurar Dominio Base (Opcional)

Si compraste un dominio (ej. `miwebdebodas.com`), crea un registro A:

**En tu proveedor de dominio (GoDaddy, Namecheap, etc.):**

```
Tipo:  A
Nombre: @  (o miwebdebodas.com)
Valor:  TU_IP_DE_CONTABO
TTL:    3600
```

**Para wildcard (subdominios):**
```
Tipo:  A
Nombre: *
Valor:  TU_IP_DE_CONTABO
TTL:    3600
```

Esto permitirá que cualquier subdominio (ej. `redy-patricia.miwebdebodas.com`) apunte al servidor.

### 6.3. Dominios Personalizados de Usuarios

Cuando un usuario compre `redyypatricia.com`, debe:

1. Ir a su proveedor de dominios.
2. Crear registro A:
   ```
   Tipo:  A
   Nombre: @
   Valor:  TU_IP_DE_CONTABO
   TTL:    3600
   ```
3. En tu panel web (Dashboard de la boda):
   - Clic en "Configurar dominio"
   - Ingresar `redyypatricia.com`
   - Guardar y verificar DNS

Traefik emitirá automáticamente un certificado SSL para ese dominio la primera vez que lo visite.

---

## 🔍 7. Verificación y Testing

### 7.1. Verificar Servicios

```bash
# Ver contenedores corriendo
docker compose ps

# Estado de salud
docker compose exec app php artisan --version

# Conectar a MySQL
docker compose exec mysql mysql -u db_wedding -p
# Contraseña: la de DB_PASSWORD en .env
```

### 7.2. Probar Endpoints

```bash
# Healthcheck del backend
curl http://localhost/api

# Frontend
curl http://localhost/
```

### 7.3. Verificar Certificados SSL

Una vez que un dominio apunte al servidor:
```bash
# Ver certificados emitidos
docker compose exec traefik ls -l /letsencrypt/acme.json

# Logs de Traefik
docker compose logs traefik | grep acme
```

---

## 🛡️ 8. Seguridad Básica

### 8.1. Cambiar Contraseñas por Defecto

**MySQL:**
```bash
docker compose exec mysql mysql -u root -p
# Contraseña actual: root (de docker-compose.yml)

ALTER USER 'db_wedding'@'%' IDENTIFIED BY 'NUEVA_CONTRASEÑA_SEGURA';
FLUSH PRIVILEGES;
```

Actualiza también en `/opt/wedding/boda-backend/.env`:
```env
DB_PASSWORD=NUEVA_CONTRASEÑA_SEGURA
```

**phpMyAdmin (opcional: deshabilitarlo en producción):**
```yaml
# En docker-compose.yml, comenta o elimina el servicio phpmyadmin
# phpmyadmin:
#   image: phpmyadmin/phpmyadmin
#   ...
```

### 8.2. Deshabilitar Debug

En `.env`:
```env
APP_DEBUG=false
LOG_LEVEL=error
```

### 8.3. Configurar Fail2Ban (Opcional)

Protege contra ataques de fuerza bruta SSH:
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 🔄 9. Mantenimiento y Actualizaciones

### 9.1. Ver Logs en Tiempo Real

```bash
# Todos los servicios
docker compose logs -f

# Solo un servicio
docker compose logs -f app
docker compose logs -f frontend
docker compose logs -f mysql
```

### 9.2. Reiniciar Servicios

```bash
# Reiniciar todo
docker compose restart

# Reiniciar un servicio específico
docker compose restart app
docker compose restart frontend
```

### 9.3. Actualizar el Código

```bash
cd /opt/wedding

# Opción A: Pull desde Git
git pull origin main

# Opción B: Subir archivos nuevos con SCP/SFTP

# Rebuild y redeploy
cd boda-backend
docker compose down
docker compose build --no-cache
docker compose up -d

# Limpiar caché de Laravel
docker compose exec app php artisan cache:clear
docker compose exec app php artisan config:clear
docker compose exec app php artisan route:clear
```

### 9.4. Backup de Base de Datos

```bash
# Crear backup
docker compose exec mysql mysqldump -u db_wedding -p db_wedding > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker compose exec -T mysql mysql -u db_wedding -p db_wedding < backup_20251219_120000.sql
```

### 9.5. Backup de Archivos Subidos

```bash
# Copiar storage/app/public
docker compose exec app tar -czf /tmp/storage_backup.tar.gz storage/app/public
docker compose cp app:/tmp/storage_backup.tar.gz ./storage_backup_$(date +%Y%m%d).tar.gz
```

---

## 📊 10. Monitoreo

### 10.1. Ver Uso de Recursos

```bash
# Uso de contenedores
docker stats

# Espacio en disco
df -h

# Logs de sistema
sudo journalctl -u docker -f
```

### 10.2. Limpiar Recursos Docker (Opcional)

```bash
# Eliminar imágenes sin usar
docker image prune -a

# Eliminar volúmenes sin usar
docker volume prune

# Limpieza completa (¡cuidado!)
docker system prune -a --volumes
```

---

## ❓ Troubleshooting

### Problema: "Cannot connect to MySQL"

**Solución:**
```bash
# Verificar que MySQL esté corriendo
docker compose ps mysql

# Ver logs
docker compose logs mysql

# Asegurar que DB_HOST=mysql en .env
```

### Problema: "502 Bad Gateway" en Traefik

**Solución:**
```bash
# Verificar que frontend y app estén UP
docker compose ps

# Reiniciar Traefik
docker compose restart traefik

# Ver logs de Traefik
docker compose logs traefik
```

### Problema: Certificado SSL no se emite

**Solución:**
- Verifica que el dominio apunte correctamente con `nslookup DOMINIO` o `dig DOMINIO`.
- Asegura que los puertos 80 y 443 estén abiertos (`sudo ufw status`).
- Revisa logs de Traefik: `docker compose logs traefik | grep acme`.
- Let's Encrypt tiene límite de intentos (5 por semana por dominio), usa staging primero si estás probando.

### Problema: Frontend carga pero API no responde

**Solución:**
```bash
# Verificar backend
docker compose exec app php artisan --version

# Probar endpoint directamente
curl http://localhost:8000/api

# Ver logs del backend
docker compose logs app
```

### Problema: "Permission denied" en storage

**Solución:**
```bash
docker compose exec app chown -R www-data:www-data storage bootstrap/cache
docker compose exec app chmod -R 775 storage bootstrap/cache
```

---

## 🎯 Checklist Post-Despliegue

- [ ] Servicios corriendo: `docker compose ps` (todos UP)
- [ ] Frontend accesible: `http://TU_IP/`
- [ ] Backend responde: `http://TU_IP/api`
- [ ] phpMyAdmin accesible: `http://TU_IP:8080`
- [ ] DB conectada: migraciones ejecutadas sin errores
- [ ] Storage link creado
- [ ] APP_KEY generado
- [ ] `.env` configurado correctamente (DB, email, IP)
- [ ] Firewall configurado (80, 443, 22)
- [ ] DNS configurado (si usas dominio)
- [ ] Certificado SSL emitido (si usas dominio)
- [ ] Contraseñas de DB cambiadas
- [ ] Backup configurado (script cron para DB)

---

## 📞 Comandos Útiles Rápidos

```bash
# Ver estado general
cd /opt/wedding/boda-backend && docker compose ps

# Logs en vivo
docker compose logs -f

# Reiniciar todo
docker compose restart

# Parar todo
docker compose down

# Iniciar todo
docker compose up -d

# Entrar a un contenedor
docker compose exec app bash
docker compose exec mysql bash

# Ver IP pública del servidor
curl ifconfig.me

# Verificar DNS de un dominio
nslookup redyypatricia.com
dig redyypatricia.com
```

---

## 🚀 ¡Listo!

Tu aplicación está corriendo en producción. Ahora puedes:

1. Crear usuarios desde el panel web.
2. Crear bodas con subdominios.
3. Los usuarios pueden apuntar sus dominios propios.
4. Gestionar invitados, tarjetas RSVP, fotos, etc.

**Próximos pasos recomendados:**
- Configurar backup automático con cron.
- Monitoreo con herramientas como Portainer, Grafana o Netdata.
- CDN para assets (Cloudflare, etc.).
- Optimización de imágenes con servicios externos.

---

**¿Necesitas ayuda?**  
Revisa los logs: `docker compose logs -f`  
Documentación oficial: [Docker](https://docs.docker.com), [Laravel](https://laravel.com/docs), [Traefik](https://doc.traefik.io)
