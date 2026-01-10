<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BackupRun extends Model
{
    protected $table = 'backup_runs';

    protected $fillable = [
        'started_at',
        'finished_at',
        'status',
        'file_name',
        'file_size_bytes',
        'sha256',
        'drive_path',
        'error_message',
        'meta',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'file_size_bytes' => 'integer',
        'meta' => 'array',
    ];

    /**
     * Calcular duración en segundos si está completado.
     */
    public function getDurationSecondsAttribute()
    {
        if (!$this->finished_at) {
            return null;
        }
        return $this->started_at->diffInSeconds($this->finished_at);
    }

    /**
     * Formatear tamaño en MB.
     */
    public function getFileSizeMbAttribute()
    {
        if (!$this->file_size_bytes) {
            return null;
        }
        return round($this->file_size_bytes / 1024 / 1024, 2);
    }

    /**
     * Obtener último backup exitoso.
     */
    public static function lastSuccess()
    {
        return self::where('status', 'success')
            ->orderByDesc('finished_at')
            ->first();
    }

    /**
     * Obtener backups recientes (últimos N días).
     */
    public static function recentRuns($days = 30)
    {
        return self::where('started_at', '>=', now()->subDays($days))
            ->orderByDesc('started_at')
            ->get();
    }
}
