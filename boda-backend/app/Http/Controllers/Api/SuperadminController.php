<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Boda;
use App\Models\LogAuditoria;
use App\Models\MetricaPlataforma;
use App\Models\SesionActiva;
use App\Models\IpBloqueada;
use App\Models\Role;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class SuperadminController extends Controller
{
    /**
     * Constructor - Verificar permisos de superadmin
     */
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware(function ($request, $next) {
            $user = auth()->user();
            if (!$user) {
                return response()->json(['message' => 'No autenticado'], 401);
            }
            
            // Cargar relación si no está cargada
            if (!$user->relationLoaded('rol')) {
                $user->load('rol');
            }
            
            if (!$user->rol || $user->rol->nombre !== 'superadmin') {
                return response()->json(['message' => 'Acceso no autorizado'], 403);
            }
            return $next($request);
        });
    }

    /**
     * Obtener métricas generales de la plataforma
     */
    public function obtenerMetricas(Request $request)
    {
        $rangoFechas = $request->input('rango', 30); // Últimos 30 días por defecto
        
        // Métricas generales
        $totalUsuarios = User::count();
        $usuariosActivos = User::whereDate('last_login_at', '>=', Carbon::now()->subDays(7))->count();
        $totalBodas = Boda::count();
        $bodasActivas = Boda::where('estado', 'activa')->count();
        
        // Métricas de tiempo
        $metricasHistoricas = MetricaPlataforma::where('fecha', '>=', Carbon::now()->subDays($rangoFechas))
            ->orderBy('fecha', 'desc')
            ->get();
        
        // Usuarios registrados por mes
        $usuariosPorMes = User::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as mes'),
            DB::raw('COUNT(*) as total')
        )
        ->groupBy('mes')
        ->orderBy('mes', 'desc')
        ->limit(12)
        ->get();
        
        // Bodas creadas por mes
        $bodasPorMes = Boda::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as mes'),
            DB::raw('COUNT(*) as total')
        )
        ->groupBy('mes')
        ->orderBy('mes', 'desc')
        ->limit(12)
        ->get();
        
        // Top usuarios con más bodas
        $topUsuarios = User::withCount('bodas')
            ->orderBy('bodas_count', 'desc')
            ->limit(10)
            ->get(['id', 'name', 'email']);
        
        return response()->json([
            'resumen' => [
                'total_usuarios' => $totalUsuarios,
                'usuarios_activos' => $usuariosActivos,
                'total_bodas' => $totalBodas,
                'bodas_activas' => $bodasActivas,
                'tasa_activacion' => $totalUsuarios > 0 ? round(($usuariosActivos / $totalUsuarios) * 100, 2) : 0,
            ],
            'metricas_historicas' => $metricasHistoricas,
            'usuarios_por_mes' => $usuariosPorMes,
            'bodas_por_mes' => $bodasPorMes,
            'top_usuarios' => $topUsuarios,
        ]);
    }

    /**
     * Obtener logs de auditoría
     */
    public function obtenerLogsAuditoria(Request $request)
    {
        $query = LogAuditoria::with('usuario:id,name,email')
            ->orderBy('created_at', 'desc');
        
        // Filtros opcionales
        if ($request->filled('accion')) {
            $query->where('accion', $request->accion);
        }
        
        if ($request->filled('nivel')) {
            $query->where('nivel', $request->nivel);
        }
        
        if ($request->filled('usuario_id')) {
            $query->where('usuario_id', $request->usuario_id);
        }
        
        if ($request->filled('fecha_desde')) {
            $query->whereDate('created_at', '>=', $request->fecha_desde);
        }
        
        if ($request->filled('fecha_hasta')) {
            $query->whereDate('created_at', '<=', $request->fecha_hasta);
        }
        
        $logs = $query->paginate(50);
        
        // Acciones únicas para filtros
        $accionesDisponibles = LogAuditoria::distinct()->pluck('accion');
        
        return response()->json([
            'logs' => $logs,
            'acciones_disponibles' => $accionesDisponibles,
        ]);
    }

    /**
     * Obtener sesiones activas
     */
    public function obtenerSesionesActivas()
    {
        // Limpiar sesiones expiradas primero
        SesionActiva::limpiarExpiradas();
        
        $sesionesActivas = SesionActiva::with('usuario:id,name,email')
            ->orderBy('ultima_actividad', 'desc')
            ->get();
        
        return response()->json([
            'total_sesiones' => $sesionesActivas->count(),
            'sesiones' => $sesionesActivas,
        ]);
    }

    /**
     * Obtener IPs bloqueadas
     */
    public function obtenerIpsBloqueadas()
    {
        $ipsBloqueadas = IpBloqueada::with('bloqueadoPor:id,name,email')
            ->orderBy('created_at', 'desc')
            ->get();
        
        return response()->json(['ips_bloqueadas' => $ipsBloqueadas]);
    }

    /**
     * Bloquear una IP
     */
    public function bloquearIp(Request $request)
    {
        $request->validate([
            'ip_address' => 'required|ip',
            'razon' => 'required|string|max:255',
            'duracion_horas' => 'nullable|integer|min:1',
        ]);
        
        $bloqueadoHasta = null;
        if ($request->filled('duracion_horas')) {
            $bloqueadoHasta = Carbon::now()->addHours($request->duracion_horas);
        }
        
        $ipBloqueada = IpBloqueada::bloquearIp(
            $request->ip_address,
            $request->razon,
            auth()->id(),
            $bloqueadoHasta
        );
        
        // Registrar en auditoría
        LogAuditoria::registrar(
            usuario_id: auth()->id(),
            accion: 'superadmin.ip_bloqueada',
            descripcion: "IP {$request->ip_address} bloqueada: {$request->razon}",
            nivel: 'CRITICO',
            datos_adicionales: ['ip_bloqueada' => $request->ip_address, 'duracion_horas' => $request->duracion_horas],
            entidad_tipo: IpBloqueada::class,
            entidad_id: $ipBloqueada->id
        );
        
        return response()->json([
            'message' => 'IP bloqueada exitosamente',
            'ip_bloqueada' => $ipBloqueada,
        ]);
    }

    /**
     * Desbloquear una IP
     */
    public function desbloquearIp(IpBloqueada $ipBloqueada)
    {
        $ipBloqueada->desbloquear();
        
        // Registrar en auditoría
        LogAuditoria::registrar(
            usuario_id: auth()->id(),
            accion: 'superadmin.ip_desbloqueada',
            descripcion: "IP {$ipBloqueada->ip_address} desbloqueada",
            nivel: 'MEDIO',
            datos_adicionales: ['ip_desbloqueada' => $ipBloqueada->ip_address],
            entidad_tipo: IpBloqueada::class,
            entidad_id: $ipBloqueada->id
        );
        
        return response()->json(['message' => 'IP desbloqueada exitosamente']);
    }

    /**
     * Obtener lista de todos los usuarios con detalles
     */
    public function obtenerUsuarios(Request $request)
    {
        $query = User::with(['rol', 'bodas'])
            ->withCount('bodas');
        
        // Filtros
        if ($request->filled('buscar')) {
            $buscar = $request->buscar;
            $query->where(function ($q) use ($buscar) {
                $q->where('name', 'like', "%{$buscar}%")
                  ->orWhere('email', 'like', "%{$buscar}%");
            });
        }
        
        if ($request->filled('role_id')) {
            $query->where('role_id', $request->role_id);
        }
        
        $usuarios = $query->paginate(50);
        
        return response()->json(['usuarios' => $usuarios]);
    }

    /**
     * Crear un nuevo usuario con rol superadmin
     */
    public function crearSuperadmin(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'telefono' => 'nullable|string|max:50',
        ]);

        $rolSuperadmin = Role::where('nombre', 'superadmin')->first();
        if (!$rolSuperadmin) {
            return response()->json(['message' => 'Rol superadmin no configurado'], 422);
        }

        $usuario = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'telefono' => $request->telefono,
            'rol_id' => $rolSuperadmin->id,
            'suspendido' => false,
            'activo' => true,
        ]);

        LogAuditoria::registrar(
            usuario_id: auth()->id(),
            accion: 'superadmin.crear_superadmin',
            descripcion: "Superadmin creado para {$usuario->email}",
            nivel: 'CRITICO',
            datos_adicionales: [
                'usuario_creado' => $usuario->id,
                'email' => $usuario->email,
            ],
            entidad_tipo: User::class,
            entidad_id: $usuario->id
        );

        return response()->json([
            'message' => 'Superadmin creado exitosamente',
            'usuario' => $usuario->load('rol'),
        ], 201);
    }

    /**
     * Suspender o activar un usuario
     */
    public function cambiarEstadoUsuario(Request $request, User $usuario)
    {
        $request->validate([
            'suspendido' => 'required|boolean',
            'razon' => 'nullable|string|max:255',
        ]);
        
        $usuario->update([
            'suspendido' => $request->suspendido,
            'razon_suspension' => $request->suspendido ? $request->razon : null,
        ]);
        
        $accion = $request->suspendido ? 'superadmin.usuario_suspendido' : 'superadmin.usuario_activado';
        $descripcion = $request->suspendido 
            ? "Usuario {$usuario->email} suspendido: {$request->razon}"
            : "Usuario {$usuario->email} activado";
        
        LogAuditoria::registrar(
            usuario_id: auth()->id(),
            accion: $accion,
            descripcion: $descripcion,
            nivel: 'CRITICO',
            datos_adicionales: [
                'usuario_afectado' => $usuario->id,
                'suspendido' => $request->suspendido,
                'razon' => $request->razon,
            ],
            entidad_tipo: User::class,
            entidad_id: $usuario->id
        );
        
        return response()->json([
            'message' => $request->suspendido ? 'Usuario suspendido' : 'Usuario activado',
            'usuario' => $usuario,
        ]);
    }

    /**
     * Eliminar un usuario (soft delete o permanente)
     */
    public function eliminarUsuario(Request $request, User $usuario)
    {
        $request->validate([
            'permanente' => 'boolean',
            'razon' => 'required|string|max:255',
        ]);
        
        // Cargar relación rol si no está cargada
        if (!$usuario->relationLoaded('rol')) {
            $usuario->load('rol');
        }
        
        if ($usuario->rol && $usuario->rol->nombre === 'superadmin') {
            return response()->json(['message' => 'No se puede eliminar un superadmin'], 403);
        }
        
        LogAuditoria::registrar(
            usuario_id: auth()->id(),
            accion: 'superadmin.usuario_eliminado',
            descripcion: "Usuario {$usuario->email} eliminado: {$request->razon}",
            nivel: 'CRITICO',
            datos_adicionales: [
                'usuario_eliminado' => $usuario->id,
                'permanente' => $request->permanente,
                'razon' => $request->razon,
            ],
            entidad_tipo: User::class,
            entidad_id: $usuario->id
        );
        
        if ($request->permanente) {
            $usuario->forceDelete();
            $mensaje = 'Usuario eliminado permanentemente';
        } else {
            $usuario->delete();
            $mensaje = 'Usuario eliminado';
        }
        
        return response()->json(['message' => $mensaje]);
    }

    /**
     * Impersonar un usuario (ver como usuario)
     */
    public function impersonarUsuario(User $usuario)
    {
        // Cargar relación rol si no está cargada
        if (!$usuario->relationLoaded('rol')) {
            $usuario->load('rol');
        }
        
        if ($usuario->rol && $usuario->rol->nombre === 'superadmin') {
            return response()->json(['message' => 'No se puede impersonar un superadmin'], 403);
        }
        
        // Crear token de impersonación
        $token = $usuario->createToken('impersonation')->plainTextToken;
        
        LogAuditoria::registrar(
            usuario_id: auth()->id(),
            accion: 'superadmin.impersonar_usuario',
            descripcion: "Superadmin impersonando a {$usuario->email}",
            nivel: 'MEDIO',
            datos_adicionales: ['usuario_impersonado' => $usuario->id, 'usuario_email' => $usuario->email],
            entidad_tipo: User::class,
            entidad_id: $usuario->id
        );
        
        return response()->json([
            'message' => 'Impersonación iniciada',
            'token' => $token,
            'usuario' => $usuario,
        ]);
    }

    /**
     * Exportar usuarios a CSV
     */
    public function exportarUsuarios()
    {
        $usuarios = User::with(['rol', 'bodas'])->withCount('bodas')->get();
        
        $csvData = [];
        $csvData[] = ['ID', 'Nombre', 'Email', 'Rol', 'Bodas', 'Fecha Registro', 'Último Login'];
        
        foreach ($usuarios as $usuario) {
            $csvData[] = [
                $usuario->id,
                $usuario->name,
                $usuario->email,
                $usuario->rol->nombre ?? 'Sin rol',
                $usuario->bodas_count,
                $usuario->created_at->format('Y-m-d H:i:s'),
                $usuario->last_login_at ? $usuario->last_login_at->format('Y-m-d H:i:s') : 'Nunca',
            ];
        }
        
        LogAuditoria::registrar('exportar_usuarios', auth()->id(), 'INFO', 'Usuarios exportados a CSV');
        
        return response()->json([
            'filename' => 'usuarios_' . Carbon::now()->format('Y-m-d_H-i-s') . '.csv',
            'data' => $csvData,
        ]);
    }

    /**
     * Calcular métricas del día actual
     */
    public function calcularMetricasHoy()
    {
        $metricas = MetricaPlataforma::calcularMetricasHoy();
        
        LogAuditoria::registrar('calcular_metricas', auth()->id(), 'INFO', 'Métricas del día calculadas');
        
        return response()->json([
            'message' => 'Métricas calculadas exitosamente',
            'metricas' => $metricas,
        ]);
    }
}
