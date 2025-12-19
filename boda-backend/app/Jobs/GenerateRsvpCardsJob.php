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
        $base = config('app.url') ?? url('/');

        $design = \App\Models\TarjetaDiseno::where('boda_id', $this->bodaId)->first();
        $generated = 0;

        Invitado::where('boda_id', $this->bodaId)
            ->orderBy('id')
            ->chunk(100, function ($invitados) use ($design, &$generated) {
                foreach ($invitados as $inv) {
                    try {
                        $generator = new \App\Services\RsvpCardGenerator();
                        $path = $generator->generateForInvitado($inv, $design);
                        if ($path) $generated++;
                    } catch (\Throwable $e) {
                        Log::warning('Error generating card for Invitado '.$inv->id.': '.$e->getMessage());
                    }
                }
            });

        // Update design metadata
        if ($design) {
            $design->ultimo_conteo_generado = $generated;
            $design->ultima_generacion_at = now();
            $design->estado_generacion = 'completado';
            $design->save();
        }
    }
}
