<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Verifica que el usuario autenticado tenga uno de los roles requeridos.
     * Uso: ->middleware('role:superadmin') o ->middleware('role:superadmin,admin_boda')
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();

        if (! $user || ! $user->rol) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $nombreRol = $user->rol->nombre; // campo "nombre" en tabla roles

        if (! in_array($nombreRol, $roles, true)) {
            return response()->json(['message' => 'Permiso denegado'], 403);
        }

        return $next($request);
    }
}
