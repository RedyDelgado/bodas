# 🧪 Guía de Testing - Sistema de Confirmación RSVP

## Checklist de Testing

### ✅ Frontend

#### 1. Modal RSVP
- [ ] Botón "Confirmar asistencia" abre modal
- [ ] Modal se cierra al hacer clic en X
- [ ] Modal se cierra al hacer clic fuera
- [ ] Campo código acepta solo mayúsculas
- [ ] Campo celular acepta números
- [ ] Selector de cantidad funciona (1-5)
- [ ] Contador de mensaje actualiza (200 max)
- [ ] Mensaje de error muestra si código vacío
- [ ] Mensaje de error muestra si celular < 6 dígitos

#### 2. Validación
- [ ] No permite enviar sin código
- [ ] No permite enviar con celular vacío
- [ ] Muestra error si código inválido (404)
- [ ] Muestra error si datos inválidos (422)
- [ ] Muestra error si falla servidor (5xx)

#### 3. Estados de Carga
- [ ] Botón se deshabilita mientras carga
- [ ] Muestra spinner/texto "Enviando..."
- [ ] No se puede hacer doble clic

#### 4. Celebración
- [ ] Aparece después de confirmación exitosa
- [ ] Confeti cae animado
- [ ] Muestra nombre del invitado
- [ ] Muestra cantidad de personas
- [ ] Se cierra al hacer clic
- [ ] Scroll automático a detalles

#### 5. Detalles Post-Confirmación
- [ ] Cronograma muestra correctamente
- [ ] Línea conecta los pasos
- [ ] FAQs se expanden/cierran
- [ ] Tabs de regalo cambian contenido
- [ ] Datos bancarios se muestran claros
- [ ] Información es legible

### ✅ Backend

#### 1. Endpoint POST /api/public/rsvp
```bash
curl -X POST http://localhost:8000/api/public/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "CODIGO_VALIDO",
    "respuesta": "confirmado",
    "cantidad_personas": 2,
    "celular": "987654321",
    "mensaje": "Estaré presente"
  }'
```

- [ ] Retorna 200 si todo es válido
- [ ] Retorna 404 si código no existe
- [ ] Retorna 422 si datos inválidos
- [ ] Retorna 500 si error del servidor

#### 2. Validaciones
- [ ] Código es requerido
- [ ] Respuesta es "confirmado" o "rechazado"
- [ ] Cantidad entre 1-10
- [ ] Celular máximo 20 caracteres
- [ ] Mensaje máximo 255 caracteres

#### 3. Base de Datos
- [ ] Campo `es_confirmado` se actualiza a true
- [ ] Campo `fecha_confirmacion` se llena con ahora
- [ ] Campo `pases` se actualiza con cantidad
- [ ] Campo `celular` se guarda correctamente
- [ ] Campo `notas` se guarda con mensaje
- [ ] Todos los campos están en tabla `invitados`

#### 4. Respuesta JSON
```json
{
  "message": "Respuesta registrada correctamente. ¡Gracias por confirmar!",
  "invitado": {
    "id": 123,
    "nombre_invitado": "Juan Pérez",
    "es_confirmado": true,
    "pases": 2,
    "fecha_confirmacion": "2025-12-11T14:30:00",
    "notas": "Estaré presente",
    "celular": "987654321"
  }
}
```

- [ ] Campo `message` contiene mensaje de éxito
- [ ] Campo `invitado` contiene datos actualizados
- [ ] Todos los campos vuelven correctos

### ✅ Responsividad

#### Desktop (1024px+)
- [ ] Modal se centra bien
- [ ] Cronograma con timeline horizontal
- [ ] Tabs de regalo funcionan
- [ ] Confeti se distribuye bien

#### Tablet (640-1024px)
- [ ] Modal ocupa espacio apropiado
- [ ] Componentes se adaptan
- [ ] Selectors de cantidad caben bien
- [ ] Texto es legible

#### Mobile (320-640px)
- [ ] Modal no sale de pantalla
- [ ] Botones son tocables (mín 44px)
- [ ] Campos de input son accesibles
- [ ] Confeti se distribuye bien
- [ ] FAQs se ven correctas
- [ ] Cronograma es scrolleable

### ✅ Browsers

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Safari Mobile (iOS)
- [ ] Chrome Mobile (Android)

### ✅ Accesibilidad

- [ ] Formulario tiene labels asociados
- [ ] Tab navigation funciona
- [ ] Focus visible en todos los inputs
- [ ] Colores tienen suficiente contraste
- [ ] Textos descriptivos para íconos

### ✅ Performance

- [ ] Modal carga en < 1 segundo
- [ ] Animaciones son smooth (60fps)
- [ ] No hay memory leaks
- [ ] Bundle size razonable

---

## Casos de Uso a Probar

### Caso 1: Confirmación Exitosa
1. Obtener código válido de invitado
2. Abrir modal
3. Ingresar código válido
4. Ingresar celular válido (mín 6 dígitos)
5. Seleccionar cantidad (default 1)
6. Agregar mensaje opcional
7. Hacer clic en "Confirmar"
8. ✅ Debe mostrar celebración
9. Cerrar celebración
10. ✅ Debe mostrar detalles

**Esperado**: Éxito, datos guardados en BD

### Caso 2: Código Inválido
1. Abrir modal
2. Ingresar código que NO existe
3. Ingresar celular válido
4. Hacer clic en "Confirmar"
5. ✅ Debe mostrar error 404

**Esperado**: "No encontramos tu invitación"

### Caso 3: Celular Inválido
1. Abrir modal
2. Ingresar código válido
3. Ingresar celular < 6 dígitos
4. Hacer clic en "Confirmar"
5. ✅ Debe mostrar error validación

**Esperado**: "Número de celular válido"

### Caso 4: Cantidad Máxima
1. Abrir modal
2. Ingresar datos válidos
3. Seleccionar cantidad 5 (máximo)
4. Ingresar cantidad > 5 directamente
5. ✅ Sistema debe rechazar o limitar

**Esperado**: Máximo 10 personas

### Caso 5: Mensaje Largo
1. Abrir modal
2. Ingresar datos válidos
3. Escribir mensaje > 200 caracteres
4. ✅ Contador debe mostrar límite

**Esperado**: Máximo 200 caracteres, contador rojo

### Caso 6: Mobile - Confirmación
1. Abrir en dispositivo móvil
2. Hacer clic en botón "Confirmar"
3. Modal debe ser responsivo
4. ✅ Todos los campos deben ser tocables
5. Completar confirmación

**Esperado**: Funcionalidad completa en mobile

### Caso 7: Doble Confirmación
1. Usuario A confirma
2. Usuario B confirma poco después
3. ✅ Ambas confirmaciones deben guardarse

**Esperado**: Dos registros en BD

---

## Testing de API (cURL/Postman)

### Test 1: Confirmación Exitosa
```bash
curl -X POST http://localhost:8000/api/public/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "ABCD1234",
    "respuesta": "confirmado",
    "cantidad_personas": 2,
    "celular": "987654321",
    "mensaje": "Estaré presente"
  }'
```

**Esperado**: 200 OK

### Test 2: Código Inválido
```bash
curl -X POST http://localhost:8000/api/public/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "INVALIDO",
    "respuesta": "confirmado",
    "cantidad_personas": 1,
    "celular": "987654321"
  }'
```

**Esperado**: 404 Not Found

### Test 3: Datos Incompletos
```bash
curl -X POST http://localhost:8000/api/public/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "",
    "respuesta": "confirmado"
  }'
```

**Esperado**: 422 Unprocessable Entity

### Test 4: Respuesta Rechazado
```bash
curl -X POST http://localhost:8000/api/public/rsvp \
  -H "Content-Type: application/json" \
  -d '{
    "codigo": "ABCD1234",
    "respuesta": "rechazado",
    "cantidad_personas": 0,
    "celular": "987654321"
  }'
```

**Esperado**: 200 OK, es_confirmado = false

---

## Testing de Base de Datos

### Verificar Registro
```sql
SELECT * FROM invitados 
WHERE codigo_clave = 'ABCD1234' 
AND es_confirmado = true;
```

**Esperado**: 
- es_confirmado: 1 (true)
- fecha_confirmacion: [datetime actual]
- pases: [cantidad ingresada]
- celular: [celular ingresado]
- notas: [mensaje ingresado]

### Verificar Actualización
```sql
SELECT COUNT(*) as confirmados 
FROM invitados 
WHERE boda_id = [ID_BODA] 
AND es_confirmado = true;
```

**Esperado**: Número correcto de confirmados

---

## Checklist Final

- [ ] Todos los componentes renderean correctamente
- [ ] Modal valida datos en cliente
- [ ] API responde con códigos HTTP correctos
- [ ] BD guarda datos completos
- [ ] Celebración se muestra
- [ ] Detalles post-confirmación se muestran
- [ ] Responsividad funciona en 3 breakpoints
- [ ] No hay errores en console
- [ ] Animaciones son smooth
- [ ] Mensajes de error son claros
- [ ] Documentación está completa

---

## Bugs Comunes

### 🐛 Modal no abre
- [ ] Verificar que `showRsvpModal` es true
- [ ] Verificar que `RsvpModal` está importado
- [ ] Revisar console del navegador

### 🐛 Celebración no muestra
- [ ] Verificar que `handleRsvpSuccess` se ejecuta
- [ ] Revisar que `onSuccess` está bien conectado
- [ ] Verificar respuesta de API

### 🐛 Confeti no anima
- [ ] Verificar que CSS está en el archivo
- [ ] Comprobar que z-index es suficiente
- [ ] Revisar performance (puede estar droppeando frames)

### 🐛 Datos no se guardan
- [ ] Verificar que tabla `invitados` tiene campos
- [ ] Comprobar conexión a BD
- [ ] Ver logs del servidor

### 🐛 Responsividad rota
- [ ] Verificar Tailwind breakpoints
- [ ] Comprobar viewport meta tag
- [ ] Revisar max-widths

---

## Herramientas Útiles

### Browser DevTools
```
F12 o Ctrl+Shift+I
├─ Console (ver errores)
├─ Network (ver requests)
├─ Application (localStorage)
└─ Device Toolbar (responsive)
```

### API Testing
- **Postman**: https://www.postman.com
- **REST Client** (VS Code extension)
- **cURL** (terminal)

### BD Visualization
- **PhpMyAdmin**: http://localhost/phpmyadmin
- **MySQL Workbench**
- **DBeaver**: https://dbeaver.io

---

## Performance Checklist

- [ ] Modal load time < 500ms
- [ ] API response < 1000ms
- [ ] Animaciones 60fps
- [ ] Bundle size razonable
- [ ] No console warnings
- [ ] Memory no crece indefinidamente

---

**¡Listo para testing!** 🚀
