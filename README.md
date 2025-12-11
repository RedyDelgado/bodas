# 💍 Plataforma de Bodas - Wedding Platform

Una plataforma completa para la creación, gestión y publicación de bodas en línea. Permite a los novios personalizar su boda con diferentes plantillas, gestionar invitados, RSVP, galerías de fotos y mucho más.

---

## 📋 Tabla de Contenidos

- [Descripción General](#descripción-general)
- [Características Principales](#características-principales)
- [Tecnologías Utilizadas](#tecnologías-utilizadas)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [Arquitectura](#arquitectura)
- [Base de Datos](#base-de-datos)
- [API Endpoints](#api-endpoints)
- [Desarrollo](#desarrollo)
- [Contribución](#contribución)
- [Licencia](#licencia)

---

## 🎯 Descripción General

**Bodas** es una plataforma SaaS (Software as a Service) que permite a parejas:

- Crear un sitio web personalizado para su boda
- Seleccionar entre múltiples plantillas de diseño
- Gestionar la lista de invitados
- Recibir RSVP en línea
- Compartir galerías de fotos
- Acceder a FAQs y información de planes

El proyecto está dividido en dos aplicaciones principales:
- **Backend**: API REST construida con Laravel 10
- **Frontend**: Aplicación web construida con React 19 + Vite

---

## ✨ Características Principales

### Para los Novios
- 🎨 **Plantillas Personalizables**: Múltiples diseños profesionales para elegir
- 📝 **Gestión de Invitados**: Administrar lista de invitados con diferentes estados
- 💬 **RSVP en Línea**: Sistema integrado para confirmación de asistencia
- 📸 **Galería de Fotos**: Compartir fotos antes, durante y después de la boda
- ⚙️ **Configuración Personalizada**: Ajustar colores, textos, información, etc.
- 📱 **Responsive Design**: Funciona perfectamente en dispositivos móviles
- ❓ **FAQs Personalizadas**: Crear preguntas y respuestas frecuentes para los invitados

### Para la Plataforma
- 🔐 **Autenticación Segura**: Sistema de autenticación con Sanctum
- 👥 **Gestión de Roles**: Control de permisos basado en roles (Admin, User)
- 📊 **Logging**: Registro de envíos vía WhatsApp
- 💾 **Base de Datos Robusta**: Diseño relacional escalable
- 🐳 **Docker**: Containerización para facilitar el despliegue
- 🔄 **API REST**: Endpoints bien documentados y estructurados

---

## 🛠️ Tecnologías Utilizadas

### Backend
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **Laravel** | ^10.10 | Framework web PHP |
| **PHP** | ^8.1 | Lenguaje de programación |
| **MySQL** | - | Base de datos relacional |
| **Sanctum** | ^3.3 | Autenticación API |
| **Intervention Image** | ^3.11 | Manipulación de imágenes |
| **PHPSpreadsheet** | 5.3 | Manejo de hojas de cálculo |
| **Guzzle** | ^7.2 | Cliente HTTP |
| **PHPUnit** | ^10.1 | Testing unitario |

### Frontend
| Tecnología | Versión | Propósito |
|-----------|---------|----------|
| **React** | ^19.2.0 | Librería UI |
| **React Router** | ^7.9.6 | Enrutamiento |
| **Vite** | ^5.0.0 | Build tool y dev server |
| **Axios** | ^1.13.2 | Cliente HTTP |
| **Tailwind CSS** | - | Framework CSS utilitario |
| **React Icons** | ^5.5.0 | Iconografía |
| **XLSX** | ^0.18.5 | Exportación a Excel |
| **ESLint** | ^9.39.1 | Linting |

### Infraestructura
- **Docker & Docker Compose**: Containerización
- **XAMPP/LocalHost**: Desarrollo local
- **Node.js & npm**: Gestión de dependencias frontend
- **Composer**: Gestión de dependencias PHP

---

## 📂 Estructura del Proyecto

```
wedding/
├── boda-backend/                 # API Backend (Laravel)
│   ├── app/
│   │   ├── Console/              # Comandos artisan
│   │   ├── Exceptions/           # Manejo de excepciones
│   │   ├── Http/
│   │   │   ├── Controllers/      # Controladores API
│   │   │   │   └── Api/          # Controladores para API REST
│   │   │   ├── Kernel.php        # Configuración middleware
│   │   │   └── Middleware/       # Middleware personalizado
│   │   ├── Models/               # Modelos Eloquent
│   │   │   ├── Boda.php          # Modelo de bodas
│   │   │   ├── Invitado.php      # Modelo de invitados
│   │   │   ├── User.php          # Modelo de usuarios
│   │   │   ├── Plan.php          # Modelo de planes
│   │   │   ├── Plantilla.php     # Modelo de plantillas
│   │   │   ├── FotoBoda.php      # Modelo de fotos
│   │   │   ├── Role.php          # Modelo de roles
│   │   │   └── ... (más modelos)
│   │   └── Providers/            # Service providers
│   ├── bootstrap/                # Inicialización
│   ├── config/                   # Archivos de configuración
│   │   ├── app.php
│   │   ├── database.php
│   │   ├── auth.php
│   │   ├── mail.php
│   │   ├── cors.php
│   │   └── ... (más configs)
│   ├── database/
│   │   ├── migrations/           # Migraciones de BD
│   │   ├── factories/            # Factories para testing
│   │   └── seeders/              # Seeders para datos iniciales
│   ├── routes/
│   │   ├── api.php               # Rutas API
│   │   ├── web.php               # Rutas web
│   │   ├── channels.php          # Canales broadcast
│   │   └── console.php           # Comandos console
│   ├── storage/                  # Almacenamiento de archivos
│   ├── tests/                    # Tests unitarios y feature
│   ├── vendor/                   # Dependencias Composer
│   ├── public/                   # Raíz pública
│   ├── composer.json             # Dependencias PHP
│   ├── docker-compose.yml        # Configuración Docker
│   ├── Dockerfile                # Imagen Docker
│   ├── .env.example              # Variables de entorno
│   └── README.md                 # README del backend
│
├── boda-frontend/                # Aplicación Frontend (React)
│   ├── src/
│   │   ├── app/                  # Configuración global de la app
│   │   ├── assets/               # Imágenes, fuentes, etc.
│   │   ├── features/             # Módulos por funcionalidad
│   │   │   ├── admin/            # Módulo de administración
│   │   │   ├── auth/             # Módulo de autenticación
│   │   │   ├── bodas/            # Módulo de bodas
│   │   │   ├── faqs/             # Módulo de FAQs
│   │   │   ├── fotos/            # Módulo de fotos
│   │   │   ├── invitados/        # Módulo de invitados
│   │   │   ├── planes/           # Módulo de planes
│   │   │   ├── plantillas/       # Módulo de plantillas
│   │   │   └── public/           # Vistas públicas
│   │   ├── shared/               # Componentes compartidos
│   │   ├── styles/               # Estilos globales
│   │   ├── App.jsx               # Componente raíz
│   │   ├── App.css               # Estilos de App
│   │   ├── index.css             # Estilos globales
│   │   └── main.jsx              # Punto de entrada
│   ├── public/                   # Archivos estáticos
│   │   └── img/                  # Imágenes públicas
│   ├── package.json              # Dependencias npm
│   ├── vite.config.js            # Configuración Vite
│   ├── tailwind.config.js        # Configuración Tailwind
│   ├── eslint.config.js          # Configuración ESLint
│   ├── postcss.config.js         # Configuración PostCSS
│   ├── index.html                # HTML principal
│   └── README.md                 # README del frontend
│
└── wedding.code-workspace        # Configuración workspace VS Code
```

---

## 📋 Requisitos Previos

### Sistema
- **Windows/Linux/macOS** con terminal (PowerShell en Windows)
- **Git** para control de versiones
- **XAMPP** o similar (para desarrollo local con PHP)

### Backend
- **PHP** ^8.1
- **Composer** (gestor de dependencias PHP)
- **MySQL** 8.0+
- **Node.js** 16+ (para scripts de build)
- **Docker** (opcional, para containerización)

### Frontend
- **Node.js** 16+
- **npm** 8+ o **yarn**

> Nota importante: el `dev server` del frontend usa Vite. Vite requiere **Node.js >= 20.19** o **>= 22.12**. Si tu Node está en una versión intermedia (por ejemplo 22.11.x) puede mostrar una advertencia o impedir que el servidor arranque correctamente. Recomendamos usar Node >= 22.12.

### Desarrollo - Frontend (Vite)

Sigue estos pasos para iniciar el servidor de desarrollo del frontend:

1. Abre una terminal y sitúate en la carpeta del frontend:

```powershell
cd c:\xampp\htdocs\wedding\boda-frontend
```

2. Instala dependencias (si no están instaladas):

```powershell
npm install
```

3. Arranca el servidor de desarrollo:

```powershell
npm run dev
```

Vite abrirá una URL local (por ejemplo `http://localhost:5173` o un puerto alternativo si 5173 está en uso).

Si ves un mensaje como "You are using Node.js 22.11.0. Vite requires Node.js version 20.19+ or 22.12+. Please upgrade your Node.js version.", entonces actualiza Node a una versión compatible antes de continuar.

Cómo actualizar Node en Windows (opciones):

- Opción (recomendada): Instalar nvm-windows y usarlo para administrar versiones:

     1. Descarga e instala `nvm-windows` desde https://github.com/coreybutler/nvm-windows/releases
     2. Abre PowerShell como administrador y ejecuta:

```powershell
nvm install 22.12.0
nvm use 22.12.0
node -v
```

- Opción alternativa: descargar el instalador de Node.js (LTS o la versión 22.12+) desde https://nodejs.org/ y ejecutar el instalador.

Después de actualizar Node, repite `npm install` (si es necesario) y `npm run dev`.

---

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone https://github.com/RedyDelgado/bodas.git
cd wedding
```

### 2. Configurar Backend

#### Opción A: Instalación Manual

```powershell
cd boda-backend

# Instalar dependencias PHP
composer install

# Copiar archivo de entorno
copy .env.example .env

# Generar clave de la aplicación
php artisan key:generate

# Crear base de datos y ejecutar migraciones
php artisan migrate

# Opcionalmente: Cargar datos de prueba
php artisan db:seed

# Instalar dependencias de Node.js
npm install

# Compilar assets
npm run build
```

#### Opción B: Usando Docker

```powershell
cd boda-backend

# Crear contenedores
docker-compose up -d

# Ejecutar migraciones dentro del contenedor
docker-compose exec app php artisan migrate

# Generar clave
docker-compose exec app php artisan key:generate
```

### 3. Configurar Frontend

```powershell
cd boda-frontend

# Instalar dependencias
npm install

# Verificar que todo esté correcto
npm run lint
```

---

## ⚙️ Configuración

### Backend - Variables de Entorno (.env)

```env
# Aplicación
APP_NAME=Bodas
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bodas_db
DB_USERNAME=root
DB_PASSWORD=

# Autenticación
SANCTUM_STATEFUL_DOMAINS=localhost:3000,localhost:5173

# Mail (para notificaciones)
MAIL_DRIVER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=your_username
MAIL_PASSWORD=your_password

# Otros servicios
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379
```

### Frontend - Variables de Entorno (.env)

```env
VITE_API_URL=http://localhost:8000/api
VITE_APP_URL=http://localhost:5173
```

---

## 🎮 Uso

### Iniciar el Proyecto Localmente

#### Backend
```powershell
cd boda-backend

# Opción 1: Usar servidor artisan built-in
php artisan serve

# Opción 2: Usar XAMPP (copiar a htdocs)
# El backend estará en http://localhost:8000/

# Para desarrollo: watch de assets
npm run dev
```

#### Frontend
```powershell
cd boda-frontend

# Iniciar servidor de desarrollo con Vite
npm run dev

# Acceder a http://localhost:5173
```

### Compilar para Producción

#### Backend
```powershell
cd boda-backend
npm run build  # Compilar assets
```

#### Frontend
```powershell
cd boda-frontend
npm run build  # Generar carpeta dist/
npm run preview  # Ver producción localmente
```

---

## 🏗️ Arquitectura

### Patrón MVC (Backend)

```
Solicitud HTTP
     ↓
Router (routes/api.php)
     ↓
Middleware (validación, CORS, autenticación)
     ↓
Controller (lógica de negocio)
     ↓
Model (acceso a datos)
     ↓
Database (MySQL)
     ↓
Response JSON
```

### Estructura de Componentes (Frontend)

```
App.jsx
├── Layout Principal
├── Router (React Router)
└── Páginas/Módulos
    ├── public/         (vistas públicas sin autenticación)
    ├── admin/          (panel administrativo)
    ├── auth/           (login, registro)
    └── user/           (área de usuario)
        ├── bodas/      (gestión de bodas)
        ├── invitados/  (gestión de invitados)
        ├── fotos/      (galería)
        └── ...
```

### Flujo de Autenticación

```
1. Usuario ingresa credenciales
        ↓
2. Frontend POST /api/auth/login
        ↓
3. Backend valida en BD y genera token (Sanctum)
        ↓
4. Frontend almacena token en localStorage/sessionStorage
        ↓
5. Solicitudes posteriores usan token en Header: Authorization
        ↓
6. Backend valida token en middleware de autenticación
```

---

## 💾 Base de Datos

### Modelos Principales

#### User
- Sistema de usuarios/novios
- Asociado a múltiples bodas
- Roles y permisos

#### Boda
- Sitio web de la boda
- Almacena configuración y datos de la boda
- Relaciones con plantilla, plan, invitados, fotos

#### Invitado
- Lista de invitados
- Estados: pendiente, confirmado, rechazado
- Datos de contacto y confirmación

#### FotoBoda
- Galerías de fotos
- Relación con boda
- Almacenamiento de imágenes

#### Plantilla
- Plantillas de diseño
- Configuración visual
- Información sobre la plantilla

#### Plan
- Planes de suscripción
- Características incluidas
- Precios

#### Role
- Roles de usuarios
- Permisos asociados
- Tipos: admin, user, guest

### Relaciones Clave
```
User 1 --- M Boda
Boda 1 --- M Invitado
Boda 1 --- M FotoBoda
Boda --- 1 Plantilla
Boda --- 1 Plan
User --- M Role
```

---

## 📡 API Endpoints

### Autenticación
```
POST   /api/auth/login              - Login
POST   /api/auth/logout             - Logout
GET    /api/auth/me                 - Obtener usuario actual
```

### Bodas
```
GET    /api/bodas                   - Listar bodas del usuario
POST   /api/bodas                   - Crear nueva boda
GET    /api/bodas/{id}              - Obtener detalles de boda
PUT    /api/bodas/{id}              - Actualizar boda
DELETE /api/bodas/{id}              - Eliminar boda
GET    /api/bodas/{id}/configuracion - Obtener configuración
PUT    /api/bodas/{id}/configuracion - Actualizar configuración
```

### Invitados
```
GET    /api/bodas/{bodaId}/invitados              - Listar invitados
POST   /api/bodas/{bodaId}/invitados              - Crear invitado
PUT    /api/bodas/{bodaId}/invitados/{id}        - Actualizar invitado
DELETE /api/bodas/{bodaId}/invitados/{id}        - Eliminar invitado
POST   /api/bodas/{bodaId}/invitados/{id}/rsvp   - Confirmar RSVP
```

### Fotos
```
GET    /api/bodas/{bodaId}/fotos                 - Listar fotos
POST   /api/bodas/{bodaId}/fotos                 - Subir foto
DELETE /api/bodas/{bodaId}/fotos/{id}            - Eliminar foto
```

### Plantillas
```
GET    /api/public/plantillas       - Listar plantillas (público)
GET    /api/plantillas              - Listar plantillas (admin)
POST   /api/plantillas              - Crear plantilla (admin)
PUT    /api/plantillas/{id}         - Actualizar plantilla (admin)
DELETE /api/plantillas/{id}         - Eliminar plantilla (admin)
```

### Planes
```
GET    /api/public/planes           - Listar planes (público)
GET    /api/planes                  - Listar planes (admin)
POST   /api/planes                  - Crear plan (admin)
PUT    /api/planes/{id}             - Actualizar plan (admin)
DELETE /api/planes/{id}             - Eliminar plan (admin)
```

### FAQs
```
GET    /api/bodas/{bodaId}/faqs     - Listar FAQs de boda
POST   /api/bodas/{bodaId}/faqs     - Crear FAQ
PUT    /api/bodas/{bodaId}/faqs/{id} - Actualizar FAQ
DELETE /api/bodas/{bodaId}/faqs/{id} - Eliminar FAQ
GET    /api/faqs/plataforma         - FAQs de plataforma (público)
```

### Roles (Admin)
```
GET    /api/roles                   - Listar roles
POST   /api/roles                   - Crear rol
PUT    /api/roles/{id}              - Actualizar rol
DELETE /api/roles/{id}              - Eliminar rol
```

---

## 💻 Desarrollo

### Scripts Disponibles

#### Backend
```powershell
# Desarrollo
php artisan serve              # Iniciar servidor
php artisan tinker             # Consola interactiva

# Assets
npm run dev                    # Watch mode
npm run build                  # Compilar para producción

# Base de datos
php artisan migrate            # Ejecutar migraciones
php artisan db:seed            # Cargar seeders
php artisan migrate:refresh    # Resetear BD
php artisan make:migration <name>  # Crear migración

# Testing
php artisan test               # Ejecutar tests
php artisan test --filter=TestName

# Linting
./vendor/bin/pint              # Format code
./vendor/bin/phpstan analyze   # Static analysis
```

#### Frontend
```powershell
# Desarrollo
npm run dev                    # Iniciar servidor de desarrollo
npm run preview                # Vista previa de producción

# Build
npm run build                  # Compilar para producción

# Linting
npm run lint                   # Verificar eslint
npm run lint -- --fix          # Arreglar problemas automáticamente
```

### Crear un Nuevo Controlador
```powershell
php artisan make:controller Api/MiControlador
```

### Crear un Nuevo Modelo con Migración
```powershell
php artisan make:model MiModelo -m  # -m incluye migración
```

### Crear un Nuevo Componente React
```
src/features/mifeatura/components/MiComponente.jsx
```

---

## 🔒 Seguridad

- **CORS**: Configurado en `config/cors.php`
- **CSRF**: Protección en rutas web
- **Autenticación**: Token-based con Sanctum
- **Rate Limiting**: Configurable por ruta
- **Validación**: En controllers y models
- **Hashing**: Bcrypt para contraseñas

---

## 📦 Deployment

### En Servidor Linux

1. **Preparar Servidor**
```bash
# Instalar dependencias
apt-get update
apt-get install php8.1 php8.1-fpm composer nodejs npm mysql-server

# Clonar repositorio
git clone https://github.com/RedyDelgado/bodas.git
cd wedding
```

2. **Configurar Backend**
```bash
cd boda-backend
composer install --no-dev
cp .env.example .env
php artisan key:generate
php artisan migrate --force
npm install && npm run build
```

3. **Configurar Nginx/Apache**
- Apuntar document root a `boda-backend/public`
- Configurar rewrite rules para Laravel

4. **Configurar Frontend**
```bash
cd boda-frontend
npm install
npm run build
# Servir contenido de dist/ con nginx
```

### Con Docker

```bash
cd boda-backend
docker-compose up -d --build
docker-compose exec app php artisan migrate
```

---

## 🐛 Solución de Problemas

### Backend

**Error: "CORS policy"**
- Verificar `SANCTUM_STATEFUL_DOMAINS` en `.env`
- Revisar configuración en `config/cors.php`

**Error: "Base de datos no encontrada"**
```powershell
php artisan migrate:install
php artisan migrate
```

**Error: "Permission denied" en storage**
```powershell
chmod -R 775 storage bootstrap/cache
```

### Frontend

**Módulo no encontrado**
```powershell
npm install
npm run dev
```

**API no responde**
- Verificar que el backend está corriendo
- Comprobar `VITE_API_URL` en `.env`
- Revisar conexión de red

---

## 👥 Contribución

1. Hacer fork del repositorio
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Estándares de Código

- **PHP**: PSR-12
- **JavaScript**: ESLint configuration incluida
- **Comentarios**: Documentar métodos y lógica compleja
- **Tests**: Cobertura mínima del 80%

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para detalles.

---

## 👨‍💻 Autor

**Redy Delgado**
- GitHub: [@RedyDelgado](https://github.com/RedyDelgado)

---

## 📞 Soporte

Para reportar bugs o sugerencias:
- Crear un [Issue](https://github.com/RedyDelgado/bodas/issues)
- Contactar al autor

---

## 🎉 Agradecimientos

- [Laravel](https://laravel.com) por el excelente framework
- [React](https://react.dev) por la librería de UI
- [Vite](https://vitejs.dev) por el rápido build tool
- [Tailwind CSS](https://tailwindcss.com) por los estilos

---

**Última actualización**: 11 de diciembre de 2025
