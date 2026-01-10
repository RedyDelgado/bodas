<?php

namespace App\Console;

use App\Models\BackupSetting;
use Carbon\Carbon;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // Ejecutar verificación de backups cada minuto
        // Esto chequea si HOY y AHORA coinciden con la programación en settings
        $schedule->call(function () {
            $this->checkAndRunBackup();
        })->everyMinute()->name('check-backup-schedule');
    }

    /**
     * Verificar si debe ejecutarse un backup basado en settings
     * Se ejecuta cada minuto desde el scheduler
     */
    private function checkAndRunBackup(): void
    {
        $settings = BackupSetting::settings();

        // Si está deshabilitado, no hacer nada
        if (!$settings->enabled) {
            return;
        }

        $now = Carbon::now($settings->timezone);
        $currentDay = strtolower($now->format('D')); // 'Mon', 'Tue', etc -> 'mon', 'tue', etc
        $currentTime = $now->format('H:i');

        // Convertir días cortos a 3 letras minúsculas
        $dayMap = [
            'Sun' => 'sun',
            'Mon' => 'mon',
            'Tue' => 'tue',
            'Wed' => 'wed',
            'Thu' => 'thu',
            'Fri' => 'fri',
            'Sat' => 'sat',
        ];
        $currentDay = $dayMap[ucfirst($currentDay)] ?? $currentDay;

        // Revisar si es día programado
        $scheduledDays = $settings->schedule_days ?? [];
        if (!in_array($currentDay, $scheduledDays)) {
            return;
        }

        // Revisar si es hora programada
        $scheduledTimes = $settings->schedule_times ?? [];
        if (!in_array($currentTime, $scheduledTimes)) {
            return;
        }

        // Verificar que no se haya ejecutado hace poco (evitar duplicados en el mismo minuto)
        if ($settings->last_run_at) {
            $lastRun = Carbon::parse($settings->last_run_at, $settings->timezone);
            if ($lastRun->diffInMinutes($now) < 1) {
                // Ejecutado hace menos de 1 minuto, saltar
                return;
            }
        }

        // ¡Ejecutar backup!
        \App\Jobs\RunBackupJob::dispatch(false);
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');

        require base_path('routes/console.php');
    }
}
