<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Boda;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PublicBodaController extends Controller
{
    /**
     * Producción: detectar la boda por HOST
     * (subdominio o dominio propio).
     * En local no lo vamos a usar, lo dejamos solo preparado.
     */
    public function showByHost(Request $request): JsonResponse
    {
        $host = $request->getHost(); // ej. emilia-gabriel-1.miwebdebodas.test
        $baseDomain = config('app.bodas_base_domain', 'miwebdebodas.test');

        $query = Boda::query()
            ->where('estado', 'activa')
            ->with(['configuracion', 'fotos']);

        // Para desarrollo local (localhost, 127.0.0.1) devolvemos mensaje explicativo
        if ($host === 'localhost' || str_starts_with($host, '127.')) {
            return response()->json([
                'message' => 'En desarrollo usa /api/public/boda/slug/{subdominio}.',
            ], 400);
        }

        $boda = null;

        // Si el host termina en el dominio base -> subdominio
        if ($baseDomain && str_ends_with($host, $baseDomain)) {
            // ej. host = emilia-gabriel-1.miwebdebodas.test
            $suffix = '.' . $baseDomain;
            $subdominio = str_ends_with($host, $suffix)
                ? substr($host, 0, -strlen($suffix))
                : $host;

            $boda = $query->where('subdominio', $subdominio)->first();
        } else {
            // Si no, asumimos dominio propio
            $boda = $query->where('dominio_personalizado', $host)->first();
        }

        if (! $boda) {
            return response()->json([
                'message' => 'Boda no encontrada o no publicada.',
            ], 404);
        }

        $boda->increment('total_vistas');

        return response()->json([
            'boda'          => $boda,
            'configuracion' => $boda->configuracion,
            'fotos'         => $boda->fotos,
        ]);
    }

    /**
     * Versión para DEMO / desarrollo:
     * /api/public/boda/slug/{slug}
     *
     * Usamos el campo "subdominio" como slug.
     */
    public function showBySlug(string $slug): JsonResponse
    {
        $boda = Boda::with([
            'configuracion',
            'fotos',
            'faqs',
        ])->where('subdominio', $slug)->firstOrFail();

        // opcional: contar visita
        $boda->increment('total_vistas');

        // foto de portada (por si la quieres usar en algún lado)
        $fotoPortada = $boda->fotos->firstWhere('es_portada', 1)
            ?? $boda->fotos->first();

        return response()->json([
            // Puedes devolver el modelo completo (sin duplicar relaciones)
            'boda' => $boda->makeHidden(['configuracion', 'fotos', 'faqs'])->toArray(),

            // Devolvemos la configuración tal cual (snake_case),
            // el frontend ya soporta esos nombres.
            'configuracion' => $boda->configuracion
                ? $boda->configuracion->toArray()
                : null,

             
            'fotos' => $boda->fotos->map(function ($f) {
                return [
                    'id'                 => $f->id,
                    'boda_id'            => $f->boda_id,
                    'url_imagen'         => $f->url_imagen,
                    'es_portada'         => (bool) $f->es_portada,
                    'es_galeria_privada' => $f->es_galeria_privada,
                    'orden'              => $f->orden,
                ];
            })->values(),

            // Preguntas frecuentes 
            'faqs' => $boda->faqs->toArray(),

            // si quieres seguir exponiendo la portada suelta:
            'foto_portada' => $fotoPortada
                ? $fotoPortada->url_imagen
                : null,
        ]);
    }
}
