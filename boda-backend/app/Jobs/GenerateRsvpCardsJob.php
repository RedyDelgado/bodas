<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use App\Models\Invitado;
use App\Models\Boda;
use App\Models\TarjetaDiseno;
use App\Services\RsvpCardGenerator;
use App\Services\RsvpGenerationProgress;

class GenerateRsvpCardsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $bodaId;
    public ?int $requestedBy;
    public $tries = 1;
    public $timeout = 300; // ajusta según tu servidor

    public function __construct(int $bodaId, ?int $requestedBy = null)
    {
        $this->bodaId = $bodaId;
        $this->requestedBy = $requestedBy;
    }

    public function handle()
    {
        $card = TarjetaDiseno::where('boda_id', $this->bodaId)->first();
        if (!$card) return;

        try {
            // Inicializa y marca estado en progreso para el tracker en cache
            $bodaForCount = Boda::withCount('invitados')->findOrFail($this->bodaId);
            $total = (int)($bodaForCount->invitados_count ?? 0);
            
            \Log::info("GenerateRsvpCardsJob START", ['boda_id' => $this->bodaId, 'total' => $total]);
            
            RsvpGenerationProgress::init($this->bodaId, $total);
            $card->estado_generacion = 'procesando';
            $card->ultimo_conteo_generado = 0;
            $card->save();
            RsvpGenerationProgress::setEstado($this->bodaId, 'procesando');

            $boda = Boda::with('invitados')->findOrFail($this->bodaId);
            $design = TarjetaDiseno::where('boda_id', $this->bodaId)->first();

            $generator = new RsvpCardGenerator();

            $count = 0;
            foreach ($boda->invitados as $inv) {
                try {
                    $path = $generator->generateForInvitado($inv, $design);

                    //  Solo cuenta si realmente generó archivo
                    if ($path) {
                        $count++;
                        $card->ultimo_conteo_generado = $count;
                        RsvpGenerationProgress::increment($this->bodaId, 1);
                        
                        \Log::debug("GenerateRsvpCardsJob generated", ['inv_id' => $inv->id, 'count' => $count, 'total' => $total]);

                        if ($count % 5 === 0) {
                            $card->save();
                        }
                    } else {
                        \Log::warning("No se generó tarjeta para invitado {$inv->id} (path null)");
                    }
                } catch (\Throwable $eInv) {
                    \Log::error("Error generando tarjeta invitado {$inv->id}: " . $eInv->getMessage());
                }
            }

            $card->estado_generacion = 'finalizado';
            $card->ultima_generacion_at = now();
            $card->ultimo_conteo_generado = $count;
            $card->save();
            RsvpGenerationProgress::setEstado($this->bodaId, 'finalizado');
            
            \Log::info("GenerateRsvpCardsJob DONE", ['boda_id' => $this->bodaId, 'generadas' => $count, 'total' => $total]);
        } catch (\Throwable $e) {
            \Log::error("Fallo Job GenerateRsvpCardsJob boda {$this->bodaId}: " . $e->getMessage());
            $card->estado_generacion = 'error';
            $card->ultima_generacion_at = now();
            $card->save();
            RsvpGenerationProgress::fail($this->bodaId, $e->getMessage());
        }
    }
    public function failed(\Throwable $e): void
    {
        $card = TarjetaDiseno::where('boda_id', $this->bodaId)->first();
        if (!$card) return;

        $card->estado_generacion = 'error';
        $card->ultima_generacion_at = now();
        $card->save();

        \Log::error("Job FAILED GenerateRsvpCardsJob boda {$this->bodaId}: " . $e->getMessage());
    }
}
