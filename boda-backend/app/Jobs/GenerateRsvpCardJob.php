<?php

namespace App\Jobs;

use App\Models\Invitado;
use App\Models\TarjetaDiseno;
use App\Services\RsvpCardGenerator;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class GenerateRsvpCardJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 2;
    public $timeout = 120;

    public function __construct(public int $invitadoId) {}

    public function handle(): void
    {
        $inv = Invitado::with('boda')->find($this->invitadoId);
        if (!$inv) return;

        $design = TarjetaDiseno::where('boda_id', $inv->boda_id)->first();
        if (!$design) return;

        $generator = new RsvpCardGenerator();

        // Esto debe guardar/retornar el path y actualizar los campos rsvp_card_*
        $path = $generator->generateForInvitado($inv, $design);

        // Si tu generator ya actualiza el modelo, esto puede ser opcional.
        // Si SOLO retorna $path, entonces guardamos aquí:
        if ($path) {
            $inv->forceFill([
                'rsvp_card_path' => $path,
                'rsvp_card_generated_at' => now(),
                // 'rsvp_card_hash' => $hash, // si lo manejas
            ])->saveQuietly(); // importante: evita re-disparar eventos
        }
    }
}
