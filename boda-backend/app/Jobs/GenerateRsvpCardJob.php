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

class GenerateRsvpCardJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $invitadoId;

    public function __construct(int $invitadoId)
    {
        $this->invitadoId = $invitadoId;
    }

    public function handle()
    {
        $inv = Invitado::find($this->invitadoId);
        if (!$inv) return;

        try {
            $design = \App\Models\TarjetaDiseno::where('boda_id', $inv->boda_id)->first();
            $generator = new \App\Services\RsvpCardGenerator();
            $generator->generateForInvitado($inv, $design);
        } catch (\Throwable $e) {
            Log::warning('Error generating single card for Invitado '.$inv->id.': '.$e->getMessage());
        }
    }
}
