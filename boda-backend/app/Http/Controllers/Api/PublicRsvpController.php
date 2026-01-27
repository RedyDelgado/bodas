<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invitado;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Carbon\Carbon;

class PublicRsvpController extends Controller
{
    /**
     * Días antes de la boda para cerrar confirmaciones.
     * Cambiar este valor actualizará automáticamente todos los mensajes.
     */
    const DIAS_ANTES_DEADLINE = 1;

    /**
     * Calcula el límite de confirmación: fecha_boda - DIAS_ANTES_DEADLINE días (23:59:59).
     * Plazo para confirmar espacios y cantidad de platos.
     */
    protected function calcularDeadline(?Invitado $invitado): ?Carbon
    {
        $boda = $invitado?->boda;

        if (! $boda || empty($boda->fecha_boda)) {
            return null;
        }

        try {
            return Carbon::parse($boda->fecha_boda)
                ->subDays(self::DIAS_ANTES_DEADLINE)
                ->endOfDay();
        } catch (\Throwable $e) {
            return null;
        }
    }

    protected function buildDeadlineMeta(?Carbon $deadline): array
    {
        $formatted = $deadline?->format('d/m/Y');
        $diasAntes = self::DIAS_ANTES_DEADLINE;
        $textoPlural = $diasAntes === 1 ? 'día' : 'días';
        
        return [
            'deadline'           => $deadline?->toIso8601String(),
            'deadline_formatted' => $formatted,
            'dias_antes'         => $diasAntes,
            'mensaje_deadline'   => $formatted
                ? "Solo puedes confirmar hasta el {$formatted} ({$diasAntes} {$textoPlural} antes)"
                : "Puedes confirmar hasta {$diasAntes} {$textoPlural} antes del evento.",
        ];
    }

    /**
     * Registrar la respuesta pública de un invitado.
     *
     * JSON esperado:
     * {
     *   "codigo": "ABC12345",                    // codigo_clave
     *   "respuesta": "confirmado"|"rechazado",   // requerido
     *   "cantidad_personas": 1-10,               // opcional, se guarda en pases
     *   "mensaje": "texto opcional"              // opcional, se guarda en notas
     *   "celular": "987654321"                   // opcional, se guarda en celular
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
            'celular' => ['nullable', 'string', 'max:20'],
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos inválidos.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $invitado = Invitado::with('boda')->where('codigo_clave', $request->codigo)->first();

        if (! $invitado) {
            return response()->json([
                'message' => 'Invitación no encontrada o código inválido.',
            ], 404);
        }

        $deadline = $this->calcularDeadline($invitado);
        $isClosed = $deadline && now()->greaterThan($deadline);

        if ($request->respuesta === 'confirmado' && $isClosed) {
            $meta = $this->buildDeadlineMeta($deadline);

            return response()->json([
                'message' => $meta['mensaje_deadline'] ?? 'El plazo de confirmación ha finalizado.',
                'is_closed' => true,
            ] + $meta, 422);
        }

        // Actualizamos estado de confirmación
        $nuevoEstado = $request->respuesta === 'confirmado' ? 1 : -1;
        $invitado->es_confirmado      = $nuevoEstado;
        $invitado->fecha_confirmacion = now();

        if ($request->filled('cantidad_personas')) {
            $invitado->pases = (int) $request->cantidad_personas;
        }

        if ($request->filled('mensaje')) {
            $invitado->notas = $request->mensaje;
        }

        if ($request->filled('celular')) {
            $invitado->celular = $request->celular;
        }

        $invitado->save();

        $deadlineMeta = $this->buildDeadlineMeta($deadline);

        return response()->json([
            'message'  => 'Respuesta registrada correctamente. ¡Gracias por confirmar!',
            'invitado' => [
                'id'                  => $invitado->id,
                'nombre_invitado'     => $invitado->nombre_invitado,
                'es_confirmado'       => $invitado->es_confirmado,
                'estado_publico'      => $invitado->es_confirmado === 1 ? 'confirmado' : 'pendiente',
                'pases'               => $invitado->pases,
                'fecha_confirmacion'  => $invitado->fecha_confirmacion,
                'notas'               => $invitado->notas,
                'celular'             => $invitado->celular,
            ],
        ] + $deadlineMeta);
    }
    public function validar($codigo)
    {
        $invitado = Invitado::with('boda')->where('codigo_clave', $codigo)->first();

        if (!$invitado) {
            return response()->json([
                'ok' => false,
                'message' => 'Código no encontrado'
            ], 404);
        }

        $deadline = $this->calcularDeadline($invitado);
        $isClosed = $deadline && now()->greaterThan($deadline);
        $deadlineMeta = $this->buildDeadlineMeta($deadline);

        return response()->json([
            'ok' => true,
            'is_closed' => $isClosed,
            'invitado' => [
                'id'                 => $invitado->id,
                'nombre_invitado'    => $invitado->nombre_invitado,
                'pases'              => $invitado->pases,
                // No exponemos “no asiste” en público; lo tratamos como pendiente
                'es_confirmado'      => $invitado->es_confirmado === 1 ? 1 : 0,
                'estado_publico'     => $invitado->es_confirmado === 1 ? 'confirmado' : 'pendiente',
                'fecha_confirmacion' => $invitado->fecha_confirmacion,
                'notas'              => $invitado->notas,
                'celular'            => $invitado->celular,
                'estado_interno'     => $invitado->es_confirmado,
            ],
        ] + $deadlineMeta);
    }

}
