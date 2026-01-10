<?php

namespace App\Jobs;

use App\Services\BackupService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Bus\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class RunBackupJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable;

    private bool $manual;

    /**
     * Create a new job instance.
     */
    public function __construct(bool $manual = false)
    {
        $this->manual = $manual;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        // Mutex: evitar ejecuciones paralelas
        $lockKey = 'backup_running';
        
        if (Cache::has($lockKey)) {
            Log::warning("Backup already running, skipping this attempt");
            return;
        }

        try {
            // Adquirir lock (máximo 2 horas por si algo se cuelga)
            Cache::put($lockKey, true, now()->addHours(2));

            Log::info("RunBackupJob started (manual: {$this->manual})");

            $service = new BackupService();
            $backupRun = $service->runFullBackup($this->manual);

            Log::info("RunBackupJob completed successfully", [
                'backup_run_id' => $backupRun->id,
                'status' => $backupRun->status,
            ]);
        } catch (\Exception $e) {
            Log::error("RunBackupJob failed: {$e->getMessage()}", [
                'trace' => $e->getTraceAsString(),
            ]);
            // Job falla pero el error ya está registrado en BackupRun
        } finally {
            // Liberar lock
            Cache::forget($lockKey);
        }
    }
}
