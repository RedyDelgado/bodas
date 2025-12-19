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

class GenerateRsvpCardsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $bodaId;
    public ?int $requestedBy;

    public function __construct(int $bodaId, ?int $requestedBy = null)
    {
        $this->bodaId = $bodaId;
        $this->requestedBy = $requestedBy;
    }

    public function handle()
    {
        $boda = Boda::with('invitados')->findOrFail($this->bodaId);
        $card = TarjetaDiseno::firstOrCreate(['boda_id' => $boda->id]);

        $card->estado_generacion = 'procesando';
        $card->ultimo_conteo_generado = 0;
        $card->save();

        $generator = new \App\Services\RsvpCardGenerator();

        $count = 0;

        foreach ($boda->invitados as $inv) {
            // genera png y retorna path relativo en storage public (ej: tarjetas/rsvp/..../xxx.png)
            $path = $generator->generateForInvitado($inv, $card);

            // IMPORTANTE: marca al invitado como generado
            $inv->rsvp_card_path = $path;
            $inv->rsvp_card_generated_at = now();
            $inv->save();

            $count++;

            // actualiza progreso (puedes hacerlo cada 1 o cada N)
            $card->ultimo_conteo_generado = $count;
            $card->save();
        }

        $card->estado_generacion = 'finalizado';
        $card->ultima_generacion_at = now();
        $card->save();
    }
}
