<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Boda;
use App\Models\Plan;
use App\Models\User;
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

    public function indexPropias(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $bodas = Boda::where('user_id', $user->id)
            ->with(['plan', 'plantilla'])
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

    public function resumenPropia(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $totalInvitados   = $boda->invitados()->count();
        $totalConfirmados = $boda->invitados()->where('es_confirmado', true)->count();

        return response()->json([
            'boda_id'           => $boda->id,
            'nombre_pareja'     => $boda->nombre_pareja,
            'fecha_boda'        => $boda->fecha_boda,
            'total_invitados'   => $totalInvitados,
            'total_confirmados' => $totalConfirmados,
            'total_vistas'      => $boda->total_vistas,
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
}
