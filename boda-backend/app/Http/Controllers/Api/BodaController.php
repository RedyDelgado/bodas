<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Boda;
use App\Models\Plan;
use App\Models\User;
use App\Services\DomainVerificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class BodaController extends Controller
{
    // ===================== SUPERADMIN CRUD =====================

    public function index(Request $request)
    {
        $query = Boda::with(['usuario', 'plan', 'plantilla']);

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        if ($request->filled('buscar')) {
            $busqueda = $request->buscar;
            $query->where(function ($q) use ($busqueda) {
                $q->where('nombre_pareja', 'like', "%$busqueda%")
                    ->orWhere('subdominio', 'like', "%$busqueda%")
                    ->orWhere('dominio_personalizado', 'like', "%$busqueda%");
            });
        }

        $bodas = $query->orderBy('fecha_boda', 'desc')->paginate(15);

        return response()->json($bodas);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'user_id'         => ['required', 'exists:users,id'],
            'plan_id'         => ['required', 'exists:planes,id'],
            'plantilla_id'    => ['nullable', 'exists:plantillas,id'],
            'nombre_pareja'   => ['required', 'string', 'max:150'],
            'nombre_novio_1'  => ['required', 'string', 'max:120'],
            'nombre_novio_2'  => ['required', 'string', 'max:120'],
            'correo_contacto' => ['required', 'email', 'max:150'],
            'fecha_boda'      => ['required', 'date'],
            'ciudad'          => ['required', 'string', 'max:120'],

            'subdominio' => [
                'required',
                'string',
                'max:100',
                'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/',
                'unique:bodas,subdominio',
            ],
            'dominio_personalizado' => [
                'nullable',
                'string',
                'max:150',
                'unique:bodas,dominio_personalizado',
            ],

            'usa_subdominio'            => ['sometimes', 'boolean'],
            'usa_dominio_personalizado' => ['sometimes', 'boolean'],
        ]);

        // Completar lógica de dominios / subdominios y url_publica_cache
        $data = $this->buildDomainData($data);

        $boda = Boda::create($data);

        return response()->json([
            'message' => 'Boda creada correctamente',
            'data'    => $boda->load(['usuario', 'plan', 'plantilla']),
        ], 201);
    }

    public function show(Boda $boda)
    {
        return response()->json(
            $boda->load(['usuario', 'plan', 'plantilla', 'configuracion', 'invitados', 'fotos'])
        );
    }

    public function update(Request $request, Boda $boda)
    {
        $data = $request->validate([
            'user_id'         => 'sometimes|exists:users,id',
            'plan_id'         => 'sometimes|exists:planes,id',
            'plantilla_id'    => 'nullable|exists:plantillas,id',
            'nombre_pareja'   => 'sometimes|string|max:150',
            'nombre_novio_1'  => 'sometimes|string|max:120',
            'nombre_novio_2'  => 'sometimes|string|max:120',
            'correo_contacto' => 'sometimes|email|max:150',
            'fecha_boda'      => 'sometimes|date',
            'ciudad'          => 'sometimes|string|max:120',

            'subdominio' => [
                'sometimes',
                'string',
                'max:100',
                'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/',
                'unique:bodas,subdominio,' . $boda->id,
            ],
            'dominio_personalizado' => [
                'nullable',
                'string',
                'max:150',
                'unique:bodas,dominio_personalizado,' . $boda->id,
            ],

            'usa_subdominio'            => ['sometimes', 'boolean'],
            'usa_dominio_personalizado' => ['sometimes', 'boolean'],
            'estado'                    => 'nullable|in:activa,borrador,suspendida',
        ]);

        $data = $this->buildDomainData($data, $boda);

        $boda->update($data);

        return response()->json($boda->fresh()->load(['usuario', 'plan', 'plantilla']));
    }

    public function destroy(Boda $boda)
    {
        $boda->delete();

        return response()->json(['message' => 'Boda eliminada']);
    }

    // ===================== ADMIN_BODA – BODAS PROPIAS =====================

    protected function ensureOwnerOrAbort(Boda $boda): void
    {
        /** @var User $user */
        $user = Auth::user();

        if ($user->rol?->nombre !== 'superadmin' && $boda->user_id !== $user->id) {
            abort(403, 'No tienes permiso para esta boda');
        }
    }

    /**
     * Obtener la boda del usuario autenticado (primera boda)
     * RUTA: GET /api/bodas/mi-boda
     */
    public function getMiBoda(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $boda = Boda::where('user_id', $user->id)
            ->with(['plan', 'plantilla', 'configuracion'])
            ->first();

        if (!$boda) {
            return response()->json([
                'message' => 'No tienes bodas registradas'
            ], 404);
        }

        return response()->json($boda);
    }

    public function indexPropias(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $bodas = Boda::where('user_id', $user->id)
            ->with(['plan', 'plantilla', 'configuracion'])
            ->orderBy('fecha_boda', 'desc')
            ->get();

        return response()->json($bodas);
    }

    public function showPropia(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        return response()->json(
            $boda->load(['plan', 'plantilla', 'configuracion', 'invitados', 'fotos'])
        );
    }

    public function updatePropia(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $data = $request->validate([
            'nombre_pareja'         => 'sometimes|string|max:150',
            'nombre_novio_1'        => 'sometimes|string|max:120',
            'nombre_novio_2'        => 'sometimes|string|max:120',
            'correo_contacto'       => 'sometimes|email|max:150',
            'fecha_boda'            => 'sometimes|date',
            'ciudad'                => 'sometimes|string|max:120',

            // Opcional: permitir que el propio admin de boda configure su subdominio / dominio
            'subdominio' => [
                'sometimes',
                'string',
                'max:100',
                'regex:/^[a-z0-9]+(-[a-z0-9]+)*$/',
                'unique:bodas,subdominio,' . $boda->id,
            ],
            'dominio_personalizado' => [
                'nullable',
                'string',
                'max:150',
                'unique:bodas,dominio_personalizado,' . $boda->id,
            ],
            'usa_subdominio'            => ['sometimes', 'boolean'],
            'usa_dominio_personalizado' => ['sometimes', 'boolean'],
        ]);

        $data = $this->buildDomainData($data, $boda);

        $boda->update($data);

        return response()->json($boda->fresh()->load(['plan', 'plantilla']));
    }

    /**
     * Cambiar el estado de la boda (activa/suspendida)
     * RUTA: PUT /api/mis-bodas/{boda}/estado
     */
    public function cambiarEstado(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $data = $request->validate([
            'estado' => ['required', 'in:activa,suspendida,borrador'],
        ]);

        $boda->update($data);

        return response()->json([
            'message' => 'Estado actualizado correctamente',
            'boda' => $boda->fresh()->load(['plan', 'plantilla'])
        ]);
    }

public function resumenPropia(Request $request, Boda $boda)
{
    $this->ensureOwnerOrAbort($boda);

    // Invitados
    $totalInvitados = $boda->invitados()->count();
    $totalConfirmados = $boda->invitados()->where('es_confirmado', 1)->count();
    $totalNoAsisten = $boda->invitados()->where('es_confirmado', -1)->count();
    $totalPendientes = $boda->invitados()->where('es_confirmado', 0)->count();

    // Pases (asistentes estimados) por estado
    $totalAsistentesConfirmados = $boda->invitados()
        ->where('es_confirmado', 1)
        ->sum('pases');
    $totalAsistentesPendientes = $boda->invitados()
        ->where('es_confirmado', 0)
        ->sum('pases');
    $totalAsistentesNoAsisten = $boda->invitados()
        ->where('es_confirmado', -1)
        ->sum('pases');

    // Porcentajes
    $porcentaje = function (int $valor, int $baseTotal): int {
        if ($baseTotal === 0) {
            return 0;
        }
        return (int) round(($valor * 100) / $baseTotal);
    };

    $baseTotal = $totalInvitados === 0 ? 0 : $totalInvitados;

    $porcentajes = [
        'confirmados' => $porcentaje($totalConfirmados, $baseTotal),
        'pendientes'  => $porcentaje($totalPendientes, $baseTotal),
        'no_asisten'  => $porcentaje($totalNoAsisten, $baseTotal),
    ];

    // Fotos
    $totalFotos = $boda->fotos()->count();

    // Armamos el payload EXACTO que espera el frontend
    return response()->json([
        'boda' => [
            'id'                => $boda->id,
            'nombre_pareja'     => $boda->nombre_pareja,
            'nombre_novio_1'    => $boda->nombre_novio_1,
            'nombre_novio_2'    => $boda->nombre_novio_2,
            'subdominio'        => $boda->subdominio,
            'fecha_boda'        => $boda->fecha_boda,
            'ciudad'            => $boda->ciudad,
            'estado'            => $boda->estado,
            'total_vistas'      => $boda->total_vistas,
            'usa_dominio_personalizado' => $boda->usa_dominio_personalizado,
            'dominio_personalizado'     => $boda->dominio_personalizado,
        ],
        'invitados' => [
            'total'                        => $totalInvitados,
            'confirmados'                  => $totalConfirmados,
            'pendientes'                   => $totalPendientes,
            'no_asisten'                   => $totalNoAsisten,
            'total_asistentes_confirmados' => $totalAsistentesConfirmados,
            'total_asistentes_pendientes'  => $totalAsistentesPendientes,
            'total_asistentes_no_asisten'  => $totalAsistentesNoAsisten,
            'porcentajes'                  => $porcentajes,
        ],
        'fotos' => [
            'total' => $totalFotos,
        ],
    ]);
}


    // ===================== LÓGICA DE DOMINIOS / SUBDOMINIOS =====================

    /**
     * Completa y normaliza los campos relacionados con dominios:
     * - usa_subdominio
     * - usa_dominio_personalizado
     * - dominio_verificado_at  (en demo lo marcamos como verificado)
     * - url_publica_cache
     */
    protected function buildDomainData(array $data, ?Boda $existing = null): array
    {
        // Obtenemos el plan (del request o del modelo existente)
        $planId = $data['plan_id'] ?? $existing?->plan_id;
        $plan   = $planId ? Plan::find($planId) : null;

        // Aquí puedes cambiar la condición por un boolean en la tabla planes (ej. permite_dominio_propio)
        $permiteDominioPropio = $plan && $plan->slug === 'dominio-propio';

        // Flags básicos
        $usaSubdominio = $data['usa_subdominio'] ?? true;
        $usaDominioPropioRequest = $data['usa_dominio_personalizado'] ?? false;

        $dominioPersonalizado = $data['dominio_personalizado']
            ?? $existing?->dominio_personalizado;

        $usaDominioPropio = $permiteDominioPropio
            && $usaDominioPropioRequest
            && !empty($dominioPersonalizado);

        $data['usa_subdominio']            = $usaSubdominio;
        $data['usa_dominio_personalizado'] = $usaDominioPropio;

        // dominio_verificado_at (para DEMO: lo marcamos como verificado si hay dominio)
        if ($usaDominioPropio) {
            // Si es nueva boda o se cambió el dominio, marcamos como "verificado"
            $data['dominio_verificado_at'] = now();
        } else {
            // Si ya no usa dominio propio, limpiamos verificación
            $data['dominio_verificado_at'] = null;
        }

        // Dominio base de subdominio de la plataforma (mover a config/app.php si quieres)
        $baseDomain = config('app.bodas_base_domain', 'miwebdebodas.test');

        $subdominio = $data['subdominio'] ?? $existing?->subdominio;

        // url_publica_cache: dominio propio si está activo, si no subdominio
        if ($usaDominioPropio && $dominioPersonalizado) {
            $data['url_publica_cache'] = 'https://' . $dominioPersonalizado;
        } elseif ($usaSubdominio && $subdominio) {
            $data['url_publica_cache'] = 'https://' . $subdominio . '.' . $baseDomain;
        } else {
            $data['url_publica_cache'] = null;
        }

        return $data;
    }

    // ===================== GESTIÓN DE DOMINIOS PROPIOS =====================

    /**
     * Asignar o actualizar el dominio personalizado de una boda propia.
     * POST /api/mis-bodas/{boda}/dominio
     * Body: { "dominio_personalizado": "redyypatricia.com", "verificar": true }
     */
    public function setDomainPropia(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $data = $request->validate([
            'dominio_personalizado' => [
                'required',
                'string',
                'max:150',
                'unique:bodas,dominio_personalizado,' . $boda->id,
            ],
            'verificar' => 'sometimes|boolean', // Si true, verificamos DNS inmediatamente
        ]);

        $dominio = $data['dominio_personalizado'];
        $verificar = $data['verificar'] ?? false;

        // Validar disponibilidad (por si el unique no capturó todo)
        $verifier = new DomainVerificationService();
        if (! $verifier->isDomainAvailable($dominio, $boda->id)) {
            return response()->json([
                'message' => 'Este dominio ya está en uso por otra boda.',
            ], 422);
        }

        // Actualizar boda
        $boda->dominio_personalizado = $dominio;
        $boda->usa_dominio_personalizado = true;
        $boda->usa_subdominio = false; // Si usa dominio propio, desactivamos subdominio

        // Verificar DNS si se solicita
        if ($verificar) {
            $result = $verifier->verifyDomain($dominio);
            if ($result['ok']) {
                $boda->dominio_verificado_at = now();
            } else {
                // No bloqueamos guardar, pero informamos
                $boda->dominio_verificado_at = null;
            }
        } else {
            // Si no verifica, marcamos como pendiente
            $boda->dominio_verificado_at = null;
        }

        // Reconstruir URL pública
        $baseDomain = config('app.bodas_base_domain', 'miwebdebodas.test');
        $boda->url_publica_cache = 'https://' . $dominio;

        $boda->save();

        return response()->json([
            'message' => 'Dominio personalizado actualizado correctamente.',
            'data' => [
                'dominio_personalizado' => $boda->dominio_personalizado,
                'dominio_verificado' => $boda->dominio_verificado_at !== null,
                'dominio_verificado_at' => $boda->dominio_verificado_at,
                'url_publica_cache' => $boda->url_publica_cache,
            ],
        ]);
    }

    /**
     * Eliminar el dominio personalizado y volver a usar subdominio.
     * DELETE /api/mis-bodas/{boda}/dominio
     */
    public function removeDomainPropia(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $boda->dominio_personalizado = null;
        $boda->usa_dominio_personalizado = false;
        $boda->dominio_verificado_at = null;
        $boda->usa_subdominio = true;

        // Reconstruir URL con subdominio
        $baseDomain = config('app.bodas_base_domain', 'miwebdebodas.test');
        $boda->url_publica_cache = $boda->subdominio
            ? 'https://' . $boda->subdominio . '.' . $baseDomain
            : null;

        $boda->save();

        return response()->json([
            'message' => 'Dominio personalizado eliminado. Ahora usa el subdominio.',
            'data' => [
                'usa_subdominio' => true,
                'subdominio' => $boda->subdominio,
                'url_publica_cache' => $boda->url_publica_cache,
            ],
        ]);
    }

    /**
     * Verificar si el dominio apunta correctamente a nuestro servidor.
     * POST /api/mis-bodas/{boda}/dominio/verificar
     */
    public function verifyDomainPropia(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        if (! $boda->dominio_personalizado) {
            return response()->json([
                'message' => 'Esta boda no tiene un dominio personalizado configurado.',
            ], 400);
        }

        $verifier = new DomainVerificationService();
        $result = $verifier->verifyDomain($boda->dominio_personalizado);

        if ($result['ok']) {
            $boda->dominio_verificado_at = now();
            $boda->save();

            return response()->json([
                'message' => $result['message'] ?? 'Dominio verificado correctamente.',
                'verificado' => true,
                'dominio_verificado_at' => $boda->dominio_verificado_at,
            ]);
        }

        // Si falla, limpiamos la verificación
        $boda->dominio_verificado_at = null;
        $boda->save();

        return response()->json([
            'message' => $result['error'] ?? 'No se pudo verificar el dominio.',
            'verificado' => false,
            'details' => $result,
        ], 422);
    }

    /**
     * Validar disponibilidad de un dominio sin asignarlo.
     * GET /api/validar-disponibilidad-dominio?dominio=redyypatricia.com&boda_id=5
     */
    public function checkDomainAvailability(Request $request)
    {
        $data = $request->validate([
            'dominio' => 'required|string|max:150',
            'boda_id' => 'nullable|integer|exists:bodas,id',
        ]);

        $dominio = $data['dominio'];
        $bodaId = $data['boda_id'] ?? null;

        $verifier = new DomainVerificationService();
        $available = $verifier->isDomainAvailable($dominio, $bodaId);

        return response()->json([
            'disponible' => $available,
            'dominio' => $dominio,
        ]);
    }
}
