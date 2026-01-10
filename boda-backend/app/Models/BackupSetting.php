<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BackupSetting extends Model
{
    protected $table = 'backup_settings';

    protected $fillable = [
        'enabled',
        'timezone',
        'schedule_days',
        'schedule_times',
        'retention_days',
        'include_db',
        'include_fotos',
        'include_tarjetas',
        'drive_provider',
        'drive_remote',
        'max_backup_size_mb',
        'last_run_at',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'include_db' => 'boolean',
        'include_fotos' => 'boolean',
        'include_tarjetas' => 'boolean',
        'schedule_days' => 'array',
        'schedule_times' => 'array',
        'max_backup_size_mb' => 'integer',
        'last_run_at' => 'datetime',
    ];

    /**
     * Obtener la única configuración global.
     */
    public static function settings()
    {
        return self::firstOrCreate(
            [],
            [
                'enabled' => false,
                'timezone' => 'America/Lima',
                'schedule_days' => ['mon', 'wed', 'fri'],
                'schedule_times' => ['02:00'],
                'retention_days' => 30,
                'include_db' => true,
                'include_fotos' => true,
                'include_tarjetas' => true,
                'drive_provider' => 'rclone_gdrive',
                'drive_remote' => 'gdrive:mi-boda/backups',
            ]
        );
    }

    /**
     * Relación: este setting tiene muchos backup_runs
     */
    public function backupRuns()
    {
        return $this->hasMany(BackupRun::class);
    }
}
