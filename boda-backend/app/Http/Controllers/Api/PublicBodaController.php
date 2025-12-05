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
   public function showBySlug(string $slug)
{
    $boda = Boda::with([
        'configuracion',
        'fotos',
        'faqs',
    ])->where('subdominio', $slug)->firstOrFail();

    $fotoPortada = $boda->fotos->firstWhere('es_portada', 1)
        ?? $boda->fotos->first();

    return response()->json([
        'boda' => [
            'nombre_pareja'  => $boda->nombre_pareja,
            'novio_1'        => $boda->nombre_novio_1,
            'novio_2'        => $boda->nombre_novio_2,
            'fecha_boda'     => $boda->fecha_boda,
            'ciudad'         => $boda->ciudad,
            'foto_portada'   => optional($fotoPortada)->url_imagen,
        ],
        'configuracion' => [
            'frase_principal'      => $boda->configuracion->frase_principal,
            'texto_fecha_religioso'=> $boda->configuracion->texto_fecha_religioso,
            'texto_fecha_civil'    => $boda->configuracion->texto_fecha_civil,
            'cronograma_texto'     => $boda->configuracion->cronograma_texto,
            'local_religioso'      => $boda->configuracion->local_religioso,
            'local_recepcion'      => $boda->configuracion->local_recepcion,
            'texto_historia_pareja'=> $boda->configuracion->texto_historia_pareja,
            'texto_padres_novio'   => $boda->configuracion->texto_padres_novio,
            'texto_padres_novia'   => $boda->configuracion->texto_padres_novia,
            'texto_padrinos_mayores'=> $boda->configuracion->texto_padrinos_mayores,
            'texto_padrinos_civiles'=> $boda->configuracion->texto_padrinos_civiles,
            'texto_cuentas_bancarias'=> $boda->configuracion->texto_cuentas_bancarias,
            'texto_yape'           => $boda->configuracion->texto_yape,
            'texto_mensaje_final'  => $boda->configuracion->texto_mensaje_final,
        ],
        'faqs'   => $boda->faqs,
    ]);
}
}
