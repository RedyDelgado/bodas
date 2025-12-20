<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class RsvpGenerationProgress
{
    public static function key(int $bodaId): string
    {
        return "rsvp_gen:boda:{$bodaId}";
    }

    public static function init(int $bodaId, int $total): void
    {
        Cache::put(self::key($bodaId), [
            'estado' => 'en_cola',
            'total' => $total,
            'generadas' => 0,
            'error' => null,
            'updated_at' => now()->toDateTimeString(),
        ], now()->addMinutes(30));
    }

    public static function setEstado(int $bodaId, string $estado): void
    {
        $data = Cache::get(self::key($bodaId), []);
        $data['estado'] = $estado;
        $data['updated_at'] = now()->toDateTimeString();
        Cache::put(self::key($bodaId), $data, now()->addMinutes(30));
    }

    public static function increment(int $bodaId, int $by = 1): void
    {
        $data = Cache::get(self::key($bodaId), null);
        if (!$data) return;

        $data['generadas'] = (int)($data['generadas'] ?? 0) + $by;
        $data['updated_at'] = now()->toDateTimeString();

        Cache::put(self::key($bodaId), $data, now()->addMinutes(30));
    }

    public static function fail(int $bodaId, string $msg): void
    {
        $data = Cache::get(self::key($bodaId), []);
        $data['estado'] = 'error';
        $data['error'] = $msg;
        $data['updated_at'] = now()->toDateTimeString();

        Cache::put(self::key($bodaId), $data, now()->addMinutes(30));
    }

    public static function get(int $bodaId): array
    {
        return Cache::get(self::key($bodaId), [
            'estado' => 'idle',
            'total' => 0,
            'generadas' => 0,
            'error' => null,
        ]);
    }
}
