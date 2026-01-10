<?php

namespace App\Http\Controllers\Admin;

use App\Jobs\RunBackupJob;
use App\Models\BackupRun;
use App\Models\BackupSetting;
use App\Services\BackupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;

class BackupController extends Controller
{
    /**
     * Obtener configuración actual de backups.
     */
    public function getSettings(): JsonResponse
    {
        $settings = BackupSetting::settings();

        return response()->json([
            'success' => true,
            'data' => $settings,
        ]);
    }

    /**
     * Actualizar configuración de backups.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'enabled' => 'boolean',
            'timezone' => 'string|timezone',
            'schedule_days' => 'array|min:1',
            'schedule_days.*' => 'in:sun,mon,tue,wed,thu,fri,sat',
            'schedule_times' => 'array|min:1',
            'schedule_times.*' => 'regex:/^\d{2}:\d{2}$/',
            'retention_days' => 'integer|min:1|max:365',
            'include_db' => 'boolean',
            'include_fotos' => 'boolean',
            'include_tarjetas' => 'boolean',
            'drive_remote' => 'string|required_if:enabled,true',
            'max_backup_size_mb' => 'nullable|integer|min:100',
        ]);

        $settings = BackupSetting::settings();
        $settings->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Configuración de backups actualizada',
            'data' => $settings,
        ]);
    }

    /**
     * Obtener historial de backups (últimos 30 ó X registros).
     */
    public function getHistory(Request $request): JsonResponse
    {
        $limit = $request->get('limit', 50);
        $days = $request->get('days', 90);

        $runs = BackupRun::where('started_at', '>=', now()->subDays($days))
            ->orderByDesc('started_at')
            ->limit($limit)
            ->get()
            ->map(function (BackupRun $run) {
                return [
                    'id' => $run->id,
                    'started_at' => $run->started_at->toIso8601String(),
                    'finished_at' => $run->finished_at?->toIso8601String(),
                    'status' => $run->status,
                    'file_name' => $run->file_name,
                    'file_size_mb' => $run->file_size_mb,
                    'drive_path' => $run->drive_path,
                    'duration_seconds' => $run->duration_seconds,
                    'error_message' => $run->error_message,
                    'meta' => $run->meta,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $runs,
        ]);
    }

    /**
     * Obtener detalles de un backup específico.
     */
    public function getRunDetails(BackupRun $backupRun): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $backupRun->id,
                'started_at' => $backupRun->started_at->toIso8601String(),
                'finished_at' => $backupRun->finished_at?->toIso8601String(),
                'status' => $backupRun->status,
                'file_name' => $backupRun->file_name,
                'file_size_mb' => $backupRun->file_size_mb,
                'sha256' => $backupRun->sha256,
                'drive_path' => $backupRun->drive_path,
                'duration_seconds' => $backupRun->duration_seconds,
                'error_message' => $backupRun->error_message,
                'meta' => $backupRun->meta,
            ],
        ]);
    }

    /**
     * Ejecutar backup manualmente ahora.
     */
    public function runNow(): JsonResponse
    {
        // Despachar job de backup manual
        RunBackupJob::dispatch(true);

        return response()->json([
            'success' => true,
            'message' => 'Backup iniciado en background',
        ]);
    }

    /**
     * Reintentar backup fallido.
     */
    public function retry(BackupRun $backupRun): JsonResponse
    {
        if ($backupRun->status !== 'failed') {
            return response()->json([
                'success' => false,
                'message' => 'Solo se pueden reintentar backups fallidos',
            ], 400);
        }

        RunBackupJob::dispatch(true);

        return response()->json([
            'success' => true,
            'message' => 'Reintento iniciado',
        ]);
    }

    /**
     * Verificar conexión con Google Drive.
     */
    public function verifyDriveConnection(Request $request): JsonResponse
    {
        $driveRemote = $request->get('drive_remote');

        if (!$driveRemote) {
            return response()->json([
                'success' => false,
                'message' => 'drive_remote es requerido',
            ], 400);
        }

        $isConnected = BackupService::verifyDriveConnection($driveRemote);

        return response()->json([
            'success' => true,
            'connected' => $isConnected,
            'message' => $isConnected ? 'Conexión exitosa' : 'Falló la conexión',
        ]);
    }

    /**
     * Obtener información de uso de Google Drive.
     */
    public function getDriveUsage(Request $request): JsonResponse
    {
        $settings = BackupSetting::settings();

        $usage = BackupService::getDriveUsage($settings->drive_remote);

        return response()->json([
            'success' => true,
            'data' => [
                'total_bytes' => $usage['total'],
                'used_bytes' => $usage['used'],
                'free_bytes' => $usage['free'],
                'total_gb' => round($usage['total'] / 1024 / 1024 / 1024, 2),
                'used_gb' => round($usage['used'] / 1024 / 1024 / 1024, 2),
                'free_gb' => round($usage['free'] / 1024 / 1024 / 1024, 2),
                'usage_percent' => $usage['total'] > 0 ? round(($usage['used'] / $usage['total']) * 100, 2) : 0,
            ],
        ]);
    }

    /**
     * Obtener estadísticas generales.
     */
    public function getStats(): JsonResponse
    {
        $totalRuns = BackupRun::count();
        $successRuns = BackupRun::where('status', 'success')->count();
        $failedRuns = BackupRun::where('status', 'failed')->count();
        $lastSuccessful = BackupRun::lastSuccess();
        $totalSize = BackupRun::where('status', 'success')->sum('file_size_bytes');

        return response()->json([
            'success' => true,
            'data' => [
                'total_runs' => $totalRuns,
                'successful_runs' => $successRuns,
                'failed_runs' => $failedRuns,
                'success_rate' => $totalRuns > 0 ? round(($successRuns / $totalRuns) * 100, 2) : 0,
                'last_successful_backup' => $lastSuccessful?->finished_at?->toIso8601String(),
                'total_backup_size_gb' => round($totalSize / 1024 / 1024 / 1024, 2),
                'avg_backup_size_mb' => $successRuns > 0 ? round($totalSize / $successRuns / 1024 / 1024, 2) : 0,
            ],
        ]);
    }
}
