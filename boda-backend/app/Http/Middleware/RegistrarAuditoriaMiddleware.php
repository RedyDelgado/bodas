<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Models\LogAuditoria;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware para registrar automáticamente operaciones importantes en auditoría
 */
class RegistrarAuditoriaMiddleware
{
    /**
     * Rutas que deben ser auditadas
     */
    protected $rutasAuditadas = [
        'api/bodas',
        'api/invitados',
        'api/confirmaciones',
        'api/pagos',
        'api/suscripciones',
        'api/usuarios',
        'api/superadmin',
    ];

    /**
     * Métodos HTTP que requieren auditoría
     */
    protected $metodosAuditados = ['POST', 'PUT', 'PATCH', 'DELETE'];

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ejecutar la petición primero
        $response = $next($request);

        // Solo auditar si es una operación de modificación
        if (!in_array($request->method(), $this->metodosAuditados)) {
            return $response;
        }

        // Solo auditar rutas específicas
        if (!$this->debeAuditar($request->path())) {
            return $response;
        }

        // Solo auditar respuestas exitosas (2xx)
        if ($response->getStatusCode() < 200 || $response->getStatusCode() >= 300) {
            return $response;
        }

        // Registrar la auditoría de forma asíncrona (no bloquea la respuesta)
        try {
            $this->registrarAuditoria($request, $response);
        } catch (\Exception $e) {
            // No fallar la petición si falla el registro de auditoría
            \Log::error('Error registrando auditoría: ' . $e->getMessage());
        }

        return $response;
    }

    /**
     * Verificar si la ruta debe ser auditada
     */
    protected function debeAuditar(string $ruta): bool
    {
        foreach ($this->rutasAuditadas as $rutaAuditada) {
            if (str_starts_with($ruta, $rutaAuditada)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Registrar la operación en auditoría
     */
    protected function registrarAuditoria(Request $request, Response $response): void
    {
        $usuario = $request->user();
        
        // Determinar la acción basada en método HTTP y ruta
        $accion = $this->determinarAccion($request);
        
        // Determinar el nivel de importancia
        $nivel = $this->determinarNivel($request);
        
        // Construir descripción
        $descripcion = $this->construirDescripcion($request, $response);
        
        // Obtener datos de la entidad si es posible
        $entidadInfo = $this->extraerEntidadInfo($request);
        
        // Datos adicionales con información de la petición
        $datosAdicionales = [
            'metodo' => $request->method(),
            'ruta' => $request->path(),
            'parametros' => $this->sanitizarParametros($request->all()),
            'respuesta_codigo' => $response->getStatusCode(),
        ];

        LogAuditoria::registrar(
            usuario_id: $usuario?->id,
            accion: $accion,
            descripcion: $descripcion,
            nivel: $nivel,
            ip_address: $request->ip(),
            user_agent: $request->userAgent(),
            datos_adicionales: $datosAdicionales,
            entidad_tipo: $entidadInfo['tipo'] ?? null,
            entidad_id: $entidadInfo['id'] ?? null
        );
    }

    /**
     * Determinar la acción basada en el método y la ruta
     */
    protected function determinarAccion(Request $request): string
    {
        $metodo = $request->method();
        $ruta = $request->path();
        
        // Extraer el recurso principal de la ruta
        $segmentos = explode('/', $ruta);
        $recurso = $segmentos[1] ?? 'desconocido'; // api/bodas -> bodas
        
        // Mapeo de método HTTP a acción
        $acciones = [
            'POST' => $recurso . '.creado',
            'PUT' => $recurso . '.actualizado',
            'PATCH' => $recurso . '.actualizado',
            'DELETE' => $recurso . '.eliminado',
        ];
        
        return $acciones[$metodo] ?? $recurso . '.modificado';
    }

    /**
     * Determinar el nivel de importancia
     */
    protected function determinarNivel(Request $request): string
    {
        $ruta = $request->path();
        
        // Operaciones críticas
        if (str_contains($ruta, 'superadmin') || 
            str_contains($ruta, 'pagos') ||
            str_contains($ruta, 'suscripciones') ||
            str_contains($ruta, 'usuarios') && $request->method() === 'DELETE') {
            return 'CRITICO';
        }
        
        // Operaciones importantes
        if ($request->method() === 'DELETE' || 
            str_contains($ruta, 'confirmaciones') ||
            str_contains($ruta, 'invitados')) {
            return 'MEDIO';
        }
        
        // Operaciones normales
        return 'INFO';
    }

    /**
     * Construir descripción legible
     */
    protected function construirDescripcion(Request $request, Response $response): string
    {
        $metodo = $request->method();
        $ruta = $request->path();
        $usuario = $request->user();
        
        $segmentos = explode('/', $ruta);
        $recurso = $segmentos[1] ?? 'recurso';
        
        $acciones = [
            'POST' => 'creó',
            'PUT' => 'actualizó',
            'PATCH' => 'actualizó',
            'DELETE' => 'eliminó',
        ];
        
        $verbo = $acciones[$metodo] ?? 'modificó';
        $nombreUsuario = $usuario?->name ?? 'Usuario anónimo';
        
        return "{$nombreUsuario} {$verbo} {$recurso}";
    }

    /**
     * Extraer información de la entidad desde la ruta
     */
    protected function extraerEntidadInfo(Request $request): array
    {
        $ruta = $request->path();
        $segmentos = explode('/', $ruta);
        
        // Mapeo de rutas a tipos de entidad
        $mapeoEntidades = [
            'bodas' => 'App\Models\Boda',
            'invitados' => 'App\Models\Invitado',
            'confirmaciones' => 'App\Models\Confirmacion',
            'usuarios' => 'App\Models\User',
            'suscripciones' => 'App\Models\Suscripcion',
            'pagos' => 'App\Models\Pago',
        ];
        
        $tipo = null;
        $id = null;
        
        // Buscar el recurso y su ID en la ruta
        foreach ($mapeoEntidades as $recurso => $clase) {
            if (in_array($recurso, $segmentos)) {
                $tipo = $clase;
                // Buscar el siguiente segmento numérico como ID
                $indice = array_search($recurso, $segmentos);
                if (isset($segmentos[$indice + 1]) && is_numeric($segmentos[$indice + 1])) {
                    $id = (int) $segmentos[$indice + 1];
                }
                break;
            }
        }
        
        return [
            'tipo' => $tipo,
            'id' => $id,
        ];
    }

    /**
     * Sanitizar parámetros sensibles antes de guardar
     */
    protected function sanitizarParametros(array $parametros): array
    {
        $camposSensibles = [
            'password',
            'password_confirmation',
            'token',
            'api_key',
            'secret',
            'tarjeta',
            'cvv',
        ];
        
        foreach ($camposSensibles as $campo) {
            if (isset($parametros[$campo])) {
                $parametros[$campo] = '***';
            }
        }
        
        return $parametros;
    }
}
