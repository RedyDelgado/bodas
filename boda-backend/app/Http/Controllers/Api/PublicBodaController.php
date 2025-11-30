<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Boda;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PublicBodaController extends Controller
{
    /**
     * Devuelve los datos públicos de una boda detectando por HOST.
     * Pensado para producción: dominio propio o subdominio.
     */
    public function showByHost(Request $request): JsonResponse
    {
        $host = $request->getHost(); // p.e. redyypatricia.com o pareja1.miwebdebodas.com

        // Base de subdominios, configurable en .env / config/app.php
        $baseDomain = config('app.boda_base_domain', 'miwebdebodas.com');

        $query = Boda::with(['configuracion', 'fotos', 'plantilla'])
            ->where('estado', 'activa');

        // 1) Si coincide dominio_personalizado
        $boda = (clone $query)->where('dominio_personalizado', $host)->first();

        if (! $boda) {
            // 2) Intentar como subdominio: slug.miwebdebodas.com
            if (str_ends_with($host, $baseDomain)) {
                $sub = str_replace('.' . $baseDomain, '', $host);

                $boda = (clone $query)->where('subdominio', $sub)->first();
            }
        }

        if (! $boda) {
            return response()->json([
                'message' => 'Boda no encontrada o no publicada.',
            ], 404);
        }

        // Incrementar contador de vistas
        $boda->increment('total_vistas');

        return response()->json([
            'boda'          => $boda,
            'configuracion' => $boda->configuracion,
            'fotos'         => $boda->fotos,
        ]);
    }

    /**
     * Devuelve los datos públicos de una boda usando el slug del subdominio.
     * Pensado para modo DEMO: /public/boda/slug/{subdominio}
     */
    public function showBySlug(string $slug): JsonResponse
    {
        $boda = Boda::with(['configuracion', 'fotos', 'plantilla'])
            ->where('estado', 'activa')
            ->where('subdominio', $slug)
            ->first();

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
}
