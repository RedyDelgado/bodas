<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invitado;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class PublicRsvpController extends Controller
{
    /**
     * Registrar la respuesta pública de un invitado.
     *
     * JSON esperado:
     * {
     *   "codigo": "ABC12345",                    // codigo_clave
     *   "respuesta": "confirmado"|"rechazado",   // requerido
     *   "cantidad_personas": 1-10,               // opcional, se guarda en pases
     *   "mensaje": "texto opcional"              // opcional, se guarda en notas
     * }
     */
    public function registrar(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'codigo' => ['required', 'string', 'max:50'],
            'respuesta' => [
                'required',
                Rule::in(['confirmado', 'rechazado']),
            ],
            'cantidad_personas' => ['nullable', 'integer', 'min:1', 'max:10'],
            'mensaje' => ['nullable', 'string', 'max:255'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $invitado = Invitado::where('codigo_clave', $request->codigo)->first();

        if (! $invitado) {
            return response()->json([
                'message' => 'Invitación no encontrada o código inválido.',
            ], 404);
        }

        // Actualizamos estado de confirmación
        $invitado->es_confirmado      = $request->respuesta === 'confirmado';
        $invitado->fecha_confirmacion = now();

        if ($request->filled('cantidad_personas')) {
            $invitado->pases = (int) $request->cantidad_personas;
        }

        if ($request->filled('mensaje')) {
            $invitado->notas = $request->mensaje;
        }

        $invitado->save();

        return response()->json([
            'message'  => 'Respuesta registrada correctamente. ¡Gracias por confirmar!',
            'invitado' => [
                'id'                => $invitado->id,
                'nombre_invitado'   => $invitado->nombre_invitado,
                'es_confirmado'     => $invitado->es_confirmado,
                'pases'             => $invitado->pases,
                'fecha_confirmacion'=> $invitado->fecha_confirmacion,
                'notas'             => $invitado->notas,
            ],
        ]);
    }
    public function validar($codigo)
    {
        $invitado = Invitado::where('codigo_clave', $codigo)->first();

        if (!$invitado) {
            return response()->json([
                'ok' => false,
                'message' => 'Código no encontrado'
            ], 404);
        }

        return response()->json([
            'ok' => true,
            'invitado' => $invitado
        ]);
    }

}
