# ⚙️ Configuración del Plazo de Confirmación RSVP

## 📍 Ubicación de la Configuración

La fecha límite para que los invitados confirmen su asistencia se define en **una única constante** en el backend:

**Archivo:** `boda-backend/app/Http/Controllers/Api/PublicRsvpController.php`

```php
class PublicRsvpController extends Controller
{
    /**
     * Días antes de la boda para cerrar confirmaciones.
     * Cambiar este valor actualizará automáticamente todos los mensajes.
     */
    const DIAS_ANTES_DEADLINE = 1;  // ← Cambiar aquí
```

## 🔧 Cómo Cambiar el Plazo

### Ejemplo: Cambiar a 7 días antes

1. Abre el archivo `PublicRsvpController.php`
2. Busca la línea con `const DIAS_ANTES_DEADLINE = 1;`
3. Cambia el valor por el número de días deseado:

```php
const DIAS_ANTES_DEADLINE = 7;  // Ahora será 7 días antes
```

4. Guarda el archivo
5. **No necesitas cambiar nada más** - Los mensajes se actualizarán automáticamente

## 📋 Qué se Actualiza Automáticamente

Al cambiar la constante `DIAS_ANTES_DEADLINE`, se actualizan automáticamente:

### Backend
- ✅ Cálculo de fecha límite (`fecha_boda - X días`)
- ✅ Validación de plazo cerrado
- ✅ Mensajes de error personalizados
- ✅ Respuestas de API con `dias_antes`

### Frontend
- ✅ Mensajes en el modal de confirmación
- ✅ Texto de notificación de plazo
- ✅ Mensajes de validación
- ✅ Información mostrada al usuario

## 💡 Ejemplos de Mensajes Generados

### Con `DIAS_ANTES_DEADLINE = 1`:
- "Solo puedes confirmar hasta el 25/01/2026 (1 día antes)"
- "Puedes confirmar hasta 1 día antes del evento."

### Con `DIAS_ANTES_DEADLINE = 7`:
- "Solo puedes confirmar hasta el 19/01/2026 (7 días antes)"
- "Puedes confirmar hasta 7 días antes del evento."

### Con `DIAS_ANTES_DEADLINE = 15`:
- "Solo puedes confirmar hasta el 11/01/2026 (15 días antes)"
- "Puedes confirmar hasta 15 días antes del evento."

## ⏰ Hora de Cierre

El plazo cierra a las **23:59:59** del día calculado.

Ejemplo con boda el 26/01/2026 y `DIAS_ANTES_DEADLINE = 1`:
- Fecha límite: 25/01/2026 23:59:59
- Después de esa hora: las confirmaciones se bloquean automáticamente

## 🔍 Validación

El sistema valida automáticamente:
1. Si el usuario intenta confirmar después del plazo
2. Muestra mensaje de error personalizado
3. Incluye la fecha límite en el mensaje
4. Bloquea el botón de confirmación

## 📱 Respuesta de API

La API devuelve información del deadline en formato JSON:

```json
{
  "deadline": "2026-01-25T23:59:59+00:00",
  "deadline_formatted": "25/01/2026",
  "dias_antes": 1,
  "mensaje_deadline": "Solo puedes confirmar hasta el 25/01/2026 (1 día antes)",
  "is_closed": false
}
```

El frontend usa estos valores dinámicamente para mostrar información al usuario.

## 🧪 Testing

Después de cambiar el valor, prueba:

1. **Validar código:** Verifica que el mensaje muestre los días correctos
2. **Simular fecha pasada:** Cambia temporalmente a `subDays(0)` para probar el bloqueo
3. **Verificar mensajes:** Todos deben reflejar el nuevo plazo

## 📝 Notas Importantes

- ⚠️ **No hay configuración en el frontend** - Todo se calcula desde el backend
- ✅ **Pluralización automática** - "1 día" vs "7 días" se maneja automáticamente
- 🔄 **Sin cache** - Los cambios son inmediatos al recargar
- 📅 **Dinámico por boda** - Se calcula según la `fecha_boda` de cada evento

## 🎯 Casos de Uso Comunes

### Bodas pequeñas (último momento)
```php
const DIAS_ANTES_DEADLINE = 1;  // 1 día antes
```

### Bodas medianas (planificación moderada)
```php
const DIAS_ANTES_DEADLINE = 7;  // 1 semana antes
```

### Bodas grandes (mucha planificación)
```php
const DIAS_ANTES_DEADLINE = 15;  // 2 semanas antes
```

### Eventos corporativos
```php
const DIAS_ANTES_DEADLINE = 30;  // 1 mes antes
```

---

**Última actualización:** 27 de enero de 2026
