<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Http as HttpClient;
use App\Models\Boda;
use App\Models\TarjetaDiseno;
use App\Models\Invitado;

class CardDesignController extends Controller
{
    public function store(Request $request, Boda $boda)
    {
        $this->authorize('update', $boda);

        $data = $request->input('design') ?: null;

        if (is_string($data)) {
            $designJson = json_decode($data, true) ?: null;
        } else {
            $designJson = $data ? $data : null;
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
                'plantilla_ruta' => $templatePath ?: TarjetaDiseno::where('boda_id', $boda->id)->value('plantilla_ruta'),
                'diseno_json' => $designJson ?: TarjetaDiseno::where('boda_id', $boda->id)->value('diseno_json'),
                'creado_por' => Auth::id(),
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
            \Log::warning('No se pudo generar preview: '.$e->getMessage());
        }

        $card = TarjetaDiseno::where('boda_id', $boda->id)->first();
        return response()->json(['card_design' => $card]);
    }

    public function status(Request $request, Boda $boda)
    {
        $this->authorize('view', $boda);

        $card = TarjetaDiseno::where('boda_id', $boda->id)->first();
        return response()->json(['card_design' => $card]);
    }

    public function generate(Request $request, Boda $boda)
    {
        $this->authorize('update', $boda);

        // Dispatch background job to generate cards for all invitados
        $card = TarjetaDiseno::firstOrCreate(['boda_id' => $boda->id]);
        $card->estado_generacion = 'en_cola';
        $card->ultimo_conteo_generado = 0;
        $card->ultima_generacion_at = null;
        $card->save();

        \App\Jobs\GenerateRsvpCardsJob::dispatch($boda->id, auth()->id());

        return response()->json(['message' => 'Generación en cola (background). Se procesará pronto.', 'card_design' => $card]);
    }
}
