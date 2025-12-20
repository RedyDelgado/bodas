<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\Invitado;
use App\Models\TarjetaDiseno;
use App\Services\RsvpCardGenerator;

class GenerateRsvpCardJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $invitadoId;
    public $tries = 1;
    public $timeout = 120;

    public function __construct(int $invitadoId)
    {
        $this->invitadoId = $invitadoId;
    }

    public function handle(): void
    {
        $inv = Invitado::with('boda')->find($this->invitadoId);
        if (!$inv) {
            \Log::warning("GenerateRsvpCardJob: invitado no encontrado", ['invitadoId' => $this->invitadoId]);
            return;
        }

        $design = TarjetaDiseno::where('boda_id', $inv->boda_id)->first();
        if (!$design) {
            \Log::info("GenerateRsvpCardJob: sin diseño para boda", ['boda_id' => $inv->boda_id]);
            return;
        }

        try {
            $generator = new RsvpCardGenerator();
            $path = $generator->generateForInvitado($inv, $design);
            if ($path) {
                \Log::info('GenerateRsvpCardJob: tarjeta generada', ['invitadoId' => $inv->id, 'path' => $path]);
            } else {
                \Log::warning('GenerateRsvpCardJob: generación retornó null', ['invitadoId' => $inv->id]);
            }
        } catch (\Throwable $e) {
            \Log::error('GenerateRsvpCardJob error: '.$e->getMessage(), ['invitadoId' => $inv->id]);
        }
    }
}
