# 🧪 Guía de Pruebas Locales

## ⚡ Prueba Rápida Automatizada

```powershell
cd c:\xampp\htdocs\wedding
.\test-local.ps1
```

Este script verificará automáticamente:
- ✅ Contenedores corriendo
- ✅ Datos en base de datos
- ✅ APIs funcionando
- ✅ Login funcional
- ✅ Frontend accesible

---

## 🎯 Pruebas Manuales Paso a Paso

### 1. Verificar Landing Page
**URL:** http://localhost:5173

**Verificar:**
- ✅ Página carga sin errores
- ✅ No hay errores de CORS en la consola (F12)
- ✅ Se ven los planes y plantillas (cargados desde la API)
- ✅ Botones "Crear cuenta" y "Iniciar sesión" funcionan

---

### 2. Probar Registro (Nuevo Diseño Premium)
**URL:** http://localhost:5173/registro

**Verificar:**
- ✅ Diseño premium con gradientes rosa-morado
- ✅ 3 secciones numeradas (Información Personal, Seguridad, Datos de Boda)
- ✅ Campo "Contraseña" tiene icono de ojo para mostrar/ocultar
- ✅ Campo "Repetir contraseña" existe
- ✅ Campo "Repetir contraseña" también tiene icono de ojo
- ✅ Al escribir contraseñas diferentes, aparece mensaje rojo "Las contraseñas no coinciden" con ✗
- ✅ Al coincidir las contraseñas, aparece mensaje verde "Las contraseñas coinciden" con ✓
- ✅ Validación de longitud mínima (6 caracteres) con ✓/✗
- ✅ Botón de registro deshabilitado hasta que las contraseñas coincidan
- ✅ Al hacer clic en "Crear mi sitio de boda", aparece spinner animado

**Datos de prueba:**
```
Nombre: Test User
Email: test@test.com
Contraseña: test123
Repetir contraseña: test123
Nombre de pareja: Test & Partner
Subdominio: test-boda
Ciudad: Lima
Fecha: 2026-06-15
```

**Resultado esperado:**
- Spinner aparece con texto "Creando tu cuenta..."
- Redirección al panel de administración
- Usuario puede navegar

---

### 3. Probar Login
**URL:** http://localhost:5173/login

**Verificar:**
- ✅ Link "¿Olvidaste tu contraseña?" existe y funciona
- ✅ Al hacer clic en botón "Ingresar", aparece spinner con icono de candado
- ✅ Login exitoso con superadministrador

**Datos de prueba (Superadmin):**
```
Email: redy.delgado@gmail.com
Password: R3DY-ARDOS
```

**Resultado esperado:**
- Spinner aparece con texto "Ingresando..."
- Redirección al panel correcto según rol
- No hay errores de autenticación

---

### 4. Probar Recuperación de Contraseña
**URL:** http://localhost:5173/forgot-password

**Verificar:**
- ✅ Diseño premium con gradiente azul-índigo
- ✅ Icono de sobre en el header
- ✅ Campo de email con validación
- ✅ Botón muestra spinner al hacer clic
- ✅ Link "Volver al inicio de sesión" funciona

**Datos de prueba:**
```
Email: redy.delgado@gmail.com
```

**Resultado esperado:**
- Spinner aparece con texto "Enviando..."
- Mensaje de éxito con icono de check verde
- Mensaje: "¡Correo enviado!"

**Nota:** Para que funcione completamente en producción, necesitas configurar el correo en `.env`

---

### 5. Probar Spinners en RSVP
**URL:** Necesitas crear una boda primero y obtener un código RSVP

**Crear boda de prueba:**
1. Login como superadmin o usuario
2. Ir al panel
3. Crear una boda
4. Agregar un invitado
5. Copiar código RSVP

**Luego probar:**
**URL:** http://localhost:5173/rsvp/[CODIGO]

**Verificar:**
- ✅ Al hacer clic en "Enviar respuesta", aparece spinner
- ✅ Icono de envío (sobre) se cambia por spinner animado
- ✅ Texto cambia a "Enviando..."

---

### 6. Verificar APIs Públicas (Sin CORS)

Abre la consola del navegador (F12 → Console) y ejecuta:

```javascript
// Probar planes
fetch('http://localhost:8000/api/public/planes')
  .then(r => r.json())
  .then(d => console.log('Planes:', d))

// Probar plantillas
fetch('http://localhost:8000/api/public/plantillas')
  .then(r => r.json())
  .then(d => console.log('Plantillas:', d))

// Probar FAQs
fetch('http://localhost:8000/api/public/faqs')
  .then(r => r.json())
  .then(d => console.log('FAQs:', d))
```

**Resultado esperado:**
- ✅ No hay errores de CORS
- ✅ Las APIs responden con datos
- ✅ StatusCode 200 en todas

---

### 7. Probar Validaciones en Tiempo Real

**En página de registro:**

1. **Contraseña corta:**
   - Escribe: `12345` (5 caracteres)
   - Verifica: ✗ "Mínimo 6 caracteres" aparece en rojo

2. **Contraseña correcta:**
   - Escribe: `123456` (6 caracteres)
   - Verifica: ✓ "Mínimo 6 caracteres" aparece en verde

3. **Contraseñas no coinciden:**
   - Contraseña: `test123`
   - Repetir: `test456`
   - Verifica: ✗ "Las contraseñas no coinciden" en rojo
   - Verifica: Botón deshabilitado

4. **Contraseñas coinciden:**
   - Contraseña: `test123`
   - Repetir: `test123`
   - Verifica: ✓ "Las contraseñas coinciden" en verde
   - Verifica: Botón habilitado

---

## 🔍 Checklist Completo

### Diseño y UX
- [ ] Gradientes se ven correctamente (rosa/morado en registro, azul/índigo en recuperar)
- [ ] Iconos de React Icons se muestran correctamente
- [ ] Animaciones son suaves
- [ ] Responsive: todo se ve bien en móvil (F12 → Toggle device toolbar)

### Validaciones
- [ ] Campo repetir contraseña funciona
- [ ] Iconos de ojo muestran/ocultan contraseñas
- [ ] Validación en tiempo real funciona
- [ ] Mensajes de error son claros

### Spinners
- [ ] Login muestra spinner
- [ ] Registro muestra spinner
- [ ] Recuperar contraseña muestra spinner
- [ ] RSVP muestra spinner
- [ ] Todos los spinners son animados (girando)

### Funcionalidad
- [ ] Registro crea usuario y boda
- [ ] Login funciona con superadmin
- [ ] Recuperar contraseña envía request
- [ ] No hay errores de CORS
- [ ] APIs responden correctamente

### Superadministrador
- [ ] Cuenta existe en base de datos
- [ ] Login funciona con credenciales correctas
- [ ] Tiene permisos de superadmin

---

## 🐛 Si Encuentras Problemas

### El frontend no carga
```powershell
cd c:\xampp\htdocs\wedding\boda-backend
docker-compose restart frontend
```

### Error de CORS en consola
```powershell
docker-compose exec app php artisan config:clear
docker-compose restart app
```

### No existe el superadmin
```powershell
docker-compose exec app php artisan db:seed --class=SuperAdminSeeder
```

### APIs dan error 500
```powershell
# Ver logs
docker-compose logs -f app

# Verificar datos
docker-compose exec app php artisan tinker
>>> App\Models\Plan::count()
>>> App\Models\Plantilla::count()
```

### Limpiar todo y empezar de nuevo
```powershell
docker-compose down
docker-compose up -d
docker-compose exec app php artisan migrate:fresh --seed
```

---

## ✅ Resultado Esperado

Si todo funciona correctamente:
- ✅ No hay errores de CORS
- ✅ Todas las páginas cargan
- ✅ Registro funciona con validaciones
- ✅ Login funciona
- ✅ Recuperar contraseña funciona
- ✅ Spinners aparecen en todos los botones
- ✅ Diseño es premium y moderno
- ✅ Validaciones en tiempo real funcionan

**Una vez verificado todo en local, ya puedes subir a producción con confianza.**

---

## 📝 Notas Adicionales

### Configuración de Correo (Opcional para testing local)
Para probar recuperación de contraseña con correos reales, configura en `.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=tu-usuario-mailtrap
MAIL_PASSWORD=tu-password-mailtrap
```

Luego:
```powershell
docker-compose exec app php artisan config:clear
docker-compose restart app
```

### React Icons
Las aplicación usa estos iconos de `react-icons`:
- `FiEye`, `FiEyeOff` - Mostrar/ocultar contraseña
- `FiCheck`, `FiX` - Validaciones
- `FiLock` - Login
- `FiMail` - Recuperar contraseña
- `FiSend` - RSVP
- `ImSpinner2` - Spinner de carga

Si falta instalar:
```powershell
cd c:\xampp\htdocs\wedding\boda-frontend
npm install react-icons
```
