<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http as HttpClient;
use App\Models\Boda;
use App\Models\Invitado;
use App\Models\User;
use App\Models\TarjetaDiseno;
use App\Jobs\GenerateRsvpCardsJob;
use App\Services\RsvpGenerationProgress;

class CardDesignController extends Controller
{

    protected function ensureOwnerOrAbort(Boda $boda): void
    {
        /** @var User|null $user */
        $user = Auth::user();

        if (!$user) {
            abort(401, 'No autenticado');
        }

        if ($user->rol?->nombre !== 'superadmin' && $boda->user_id !== $user->id) {
            abort(403, 'No tienes permiso para esta boda');
        }
    }


    public function store(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $data = $request->input('design') ?: null;
        if (is_string($data)) {
            $designJson = json_decode($data, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return response()->json([
                    'message' => 'El diseño JSON es inválido: ' . json_last_error_msg(),
                ], 422);
            }
        } else {
            $designJson = $data;
        }


        $templatePath = null;
        if ($request->hasFile('template')) {
            $file = $request->file('template');
            $path = $file->store("tarjetas/plantillas/{$boda->id}", 'public');
            $templatePath = $path;
        }

        // Guardar en la tabla en español `tarjeta_disenos`
        $card = TarjetaDiseno::updateOrCreate(
            ['boda_id' => $boda->id],
            [
                'plantilla_ruta' => $templatePath ?? TarjetaDiseno::where('boda_id', $boda->id)->value('plantilla_ruta'),
                'diseno_json'    => $designJson  ?? TarjetaDiseno::where('boda_id', $boda->id)->value('diseno_json'),
                'creado_por'     => Auth::id(),
                'estado_generacion' => 'guardado',
            ]
        );

        // Generar preview inmediato con el primer invitado (si existe)
        try {
            $sampleInv = $boda->invitados()->first();
            if ($sampleInv) {
                $designRecord = TarjetaDiseno::where('boda_id', $boda->id)->first();
                $generator = new \App\Services\RsvpCardGenerator();
                $path = $generator->generateForInvitado($sampleInv, $designRecord);
                if ($path && $designRecord) {
                    $designRecord->ruta_vista_previa = $path;
                    $designRecord->save();
                }
            }
        } catch (\Throwable $e) {
            \Log::warning('No se pudo generar preview: ' . $e->getMessage());
        }

        $card = TarjetaDiseno::where('boda_id', $boda->id)->first();
        return response()->json(['card_design' => $card]);
    }

    public function status(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $card = TarjetaDiseno::where('boda_id', $boda->id)->first();
        return response()->json(['card_design' => $card]);
    }

public function generate(Request $request, Boda $boda)
{
    $this->ensureOwnerOrAbort($boda);

    $card = TarjetaDiseno::firstOrCreate(['boda_id' => $boda->id]);

    // ✅ 1) Validar primero
    if (!$card->plantilla_ruta || !Storage::disk('public')->exists($card->plantilla_ruta)) {
        // opcional: para no dejarlo colgado
        $card->estado_generacion = 'guardado';
        $card->save();

        return response()->json(['message' => 'Primero sube una plantilla y guarda el diseño.'], 422);
    }

    if (empty($card->diseno_json) || !is_array($card->diseno_json)) {
        $card->estado_generacion = 'guardado';
        $card->save();

        return response()->json(['message' => 'No hay configuración de diseño guardada.'], 422);
    }

    // ✅ 2) Recién aquí marcamos en cola
    $card->estado_generacion = 'en_cola';
    $card->ultimo_conteo_generado = 0;
    $card->ultima_generacion_at = null;
    $card->save();

    // 🧹 Limpiar tarjetas antiguas ANTES de regenerar (evita acumulación)
    $folder = "tarjetas/generadas/{$boda->id}";
    if (Storage::disk('public')->exists($folder)) {
        try {
            $oldFiles = Storage::disk('public')->files($folder);
            foreach ($oldFiles as $file) {
                Storage::disk('public')->delete($file);
            }
            \Log::info("CardDesigner: limpió tarjetas antiguas", ['folder' => $folder, 'count' => count($oldFiles)]);
        } catch (\Throwable $e) {
            \Log::warning("CardDesigner: error limpiando antiguas: " . $e->getMessage());
        }
    }

    // Tracker en cache para progreso en tiempo real
    $totalInv = $boda->invitados()->count();
    RsvpGenerationProgress::init($boda->id, (int)$totalInv);

    // ✅ 3) Encolar job
    GenerateRsvpCardsJob::dispatch($boda->id, auth()->id());

    return response()->json([
        'message' => 'Generación en cola (background).',
        'card_design' => $card
    ]);
}

    public function progress(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        // Mezcla cache + BD para no quedarnos con 0/total si el cache cae
        $cacheProg = RsvpGenerationProgress::get($boda->id);
        $card = TarjetaDiseno::where('boda_id', $boda->id)->first();

        $totalDb = (int) $boda->invitados()->count();
        $totalCache = (int)($cacheProg['total'] ?? 0);
        $total = $totalCache > 0 ? $totalCache : $totalDb;

        $generadasCache = (int)($cacheProg['generadas'] ?? 0);
        $generadasDb = (int)($card?->ultimo_conteo_generado ?? 0);
        $generadas = max($generadasCache, $generadasDb);

        $estadoCache = $cacheProg['estado'] ?? 'idle';
        $estado = $estadoCache !== 'idle'
            ? $estadoCache
            : ($card?->estado_generacion ?? 'sin_diseno');

        return response()->json([
            'estado' => $estado,
            'generadas' => $generadas,
            'total' => $total,
            'mensaje' => $cacheProg['error'] ?? null,
            'ultima_generacion_at' => $card?->ultima_generacion_at,
        ]);
    }
}
