<?php

namespace App\Services;

use App\Models\BackupRun;
use App\Models\BackupSetting;
use Carbon\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Process;
use Illuminate\Support\Str;

class BackupService
{
    private string $tmpDir;
    private string $readyDir;
    private string $dbName;
    private string $dbUser;
    private string $dbPassword;
    private string $dbHost;
    private string $dbPort;

    public function __construct()
    {
        $this->tmpDir = storage_path('app/backups/tmp');
        $this->readyDir = storage_path('app/backups/ready');
        
        $this->dbName = config('database.connections.mysql.database');
        $this->dbUser = config('database.connections.mysql.username');
        $this->dbPassword = config('database.connections.mysql.password');
        $this->dbHost = config('database.connections.mysql.host');
        $this->dbPort = config('database.connections.mysql.port');

        $this->ensureDirectories();
    }

    /**
     * Crear directorios si no existen.
     */
    private function ensureDirectories(): void
    {
        File::ensureDirectoryExists($this->tmpDir);
        File::ensureDirectoryExists($this->readyDir);
    }

    /**
     * Ejecutar backup completo (entrada principal).
     */
    public function runFullBackup(bool $manual = false): BackupRun
    {
        $settings = BackupSetting::settings();

        // Crear registro de ejecución
        $backupRun = BackupRun::create([
            'started_at' => now(),
            'status' => 'running',
            'meta' => [
                'manual' => $manual,
                'settings_snapshot' => [
                    'include_db' => $settings->include_db,
                    'include_fotos' => $settings->include_fotos,
                    'include_tarjetas' => $settings->include_tarjetas,
                    'drive_remote' => $settings->drive_remote,
                ],
            ],
        ]);

        try {
            Log::info("Iniciando backup #{$backupRun->id}", ['manual' => $manual]);

            $backupFiles = [];

            // 1. Dump de BD
            if ($settings->include_db) {
                $dbFile = $this->dumpDatabase($backupRun);
                if ($dbFile) {
                    $backupFiles[] = $dbFile;
                }
            }

            // 2. Archivos (fotos y tarjetas)
            if ($settings->include_fotos || $settings->include_tarjetas) {
                $fileArchives = $this->archiveFiles($backupRun, $settings);
                $backupFiles = array_merge($backupFiles, $fileArchives);
            }

            // 3. Empaquetar todo en tar.gz
            $finalFile = $this->createTarGz($backupRun, $backupFiles);

            // 4. Calcular hash
            $sha256 = hash_file('sha256', $finalFile);

            // 5. Subir a Google Drive (rclone)
            $drivePath = null;
            try {
                $drivePath = $this->uploadToDrive($finalFile, $settings->drive_remote);
            } catch (\Exception $e) {
                Log::warning("Backup #" . $backupRun->id . ": No se pudo subir a Drive", [
                    'error' => $e->getMessage(),
                ]);
                // Continuar aunque falle la subida, mantenemos el archivo local
            }

            // 6. Limpiar retención
            $this->cleanupRetention($settings, $backupRun);

            // 7. Actualizar run como exitoso
            $backupRun->update([
                'status' => 'success',
                'finished_at' => now(),
                'file_name' => basename($finalFile),
                'file_size_bytes' => filesize($finalFile),
                'sha256' => $sha256,
                'drive_path' => $drivePath,
                'meta' => array_merge($backupRun->meta ?? [], [
                    'duration_seconds' => $backupRun->started_at->diffInSeconds(now()),
                    'final_file' => $finalFile,
                    'files_count' => count($backupFiles),
                ]),
            ]);

            // 8. Actualizar last_run_at en settings
            $settings->update(['last_run_at' => now()]);

            Log::info("Backup #{$backupRun->id} completado exitosamente");

            return $backupRun;
        } catch (\Exception $e) {
            Log::error("Backup #{$backupRun->id} falló", [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            $backupRun->update([
                'status' => 'failed',
                'finished_at' => now(),
                'error_message' => $e->getMessage(),
                'meta' => array_merge($backupRun->meta ?? [], [
                    'duration_seconds' => $backupRun->started_at->diffInSeconds(now()),
                ]),
            ]);

            throw $e;
        }
    }

    /**
     * Hacer dump de la BD MySQL.
     */
    private function dumpDatabase(BackupRun $backupRun): ?string
    {
        try {
            Log::info("Dumping database...");

            $timestamp = now()->format('Y-m-d_H-i-s');
            $fileName = "db_wedding_{$timestamp}.sql";
            $filePath = "{$this->tmpDir}/{$fileName}";

            // Usar mysql -h host -u user -p password database para dump
            $password = escapeshellarg($this->dbPassword);
            $dbName = escapeshellarg($this->dbName);
            $dbUser = escapeshellarg($this->dbUser);
            $dbHost = escapeshellarg($this->dbHost);

            // En Docker, conneccion a mysql:3306 (no 33060)
            $command = "mysqldump -h {$dbHost} -P 3306 -u {$dbUser} -p{$this->dbPassword} --skip-ssl {$dbName} > {$filePath}";

            $result = Process::run($command);

            if ($result->failed()) {
                throw new \Exception("mysqldump failed: " . $result->errorOutput());
            }

            if (!file_exists($filePath) || filesize($filePath) === 0) {
                throw new \Exception("Database dump file is empty");
            }

            Log::info("Database dump created: {$fileName}");

            return $filePath;
        } catch (\Exception $e) {
            Log::error("Database dump failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Crear archivos de fotos y tarjetas.
     */
    private function archiveFiles(BackupRun $backupRun, BackupSetting $settings): array
    {
        $archives = [];
        $timestamp = now()->format('Y-m-d_H-i-s');

        try {
            // Fotos
            if ($settings->include_fotos) {
                $fotosDir = storage_path('app/public/fotos_boda');
                if (File::isDirectory($fotosDir)) {
                    $fileName = "fotos_boda_{$timestamp}.tar.gz";
                    $filePath = "{$this->tmpDir}/{$fileName}";

                    $command = "cd " . escapeshellarg(storage_path('app/public')) . " && tar -czf " . escapeshellarg($filePath) . " fotos_boda";
                    $result = Process::run($command);

                    if ($result->failed()) {
                        Log::warning("Fotos archive failed: " . $result->errorOutput());
                    } else {
                        Log::info("Fotos archived: {$fileName}");
                        $archives[] = $filePath;
                    }
                }
            }

            // Tarjetas
            if ($settings->include_tarjetas) {
                $tarjetasDir = storage_path('app/public/tarjetas');
                if (File::isDirectory($tarjetasDir)) {
                    $fileName = "tarjetas_{$timestamp}.tar.gz";
                    $filePath = "{$this->tmpDir}/{$fileName}";

                    $command = "cd " . escapeshellarg(storage_path('app/public')) . " && tar -czf " . escapeshellarg($filePath) . " tarjetas";
                    $result = Process::run($command);

                    if ($result->failed()) {
                        Log::warning("Tarjetas archive failed: " . $result->errorOutput());
                    } else {
                        Log::info("Tarjetas archived: {$fileName}");
                        $archives[] = $filePath;
                    }
                }
            }

            return $archives;
        } catch (\Exception $e) {
            Log::error("Archive creation failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Crear tar.gz final con todos los archivos.
     */
    private function createTarGz(BackupRun $backupRun, array $files): string
    {
        try {
            Log::info("Creating final tar.gz...");

            $timestamp = now()->format('Y-m-d_H-i-s');
            $fileName = "backup_bodas_{$timestamp}.tar.gz";
            $filePath = "{$this->readyDir}/{$fileName}";

            // Crear listado de archivos para tar
            $fileList = implode(' ', array_map('escapeshellarg', $files));

            $command = "cd {$this->tmpDir} && tar -czf " . escapeshellarg($filePath) . " " . str_replace("{$this->tmpDir}/", '', $fileList);
            
            $result = Process::run($command);

            if ($result->failed()) {
                throw new \Exception("tar creation failed: " . $result->errorOutput());
            }

            if (!file_exists($filePath) || filesize($filePath) === 0) {
                throw new \Exception("Final tar.gz is empty");
            }

            Log::info("Final tar.gz created: {$fileName}");

            return $filePath;
        } catch (\Exception $e) {
            Log::error("Final tar.gz creation failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Subir archivo a Google Drive usando rclone.
     */
    private function uploadToDrive(string $filePath, string $driveRemote): string
    {
        try {
            Log::info("Uploading to Google Drive: {$driveRemote}");

            $fileName = basename($filePath);
            
            // Usar rclone copy
            $command = "rclone copy " . escapeshellarg($filePath) . " " . escapeshellarg($driveRemote);

            $result = Process::run($command);

            if ($result->failed()) {
                throw new \Exception("rclone upload failed: " . $result->errorOutput());
            }

            Log::info("Upload successful to Google Drive");

            return "{$driveRemote}/{$fileName}";
        } catch (\Exception $e) {
            Log::error("Google Drive upload failed: {$e->getMessage()}");
            throw $e;
        }
    }

    /**
     * Limpiar backups antiguos según retención.
     */
    private function cleanupRetention(BackupSetting $settings, BackupRun $currentRun): void
    {
        try {
            Log::info("Cleaning up old backups (retention: {$settings->retention_days} days)");

            $cutoffDate = now()->subDays($settings->retention_days);

            // Limpiar registros en BD
            BackupRun::where('status', 'success')
                ->where('finished_at', '<', $cutoffDate)
                ->get()
                ->each(function (BackupRun $run) {
                    // Eliminar archivo local si existe
                    if ($run->meta['final_file'] ?? null) {
                        $file = $run->meta['final_file'];
                        if (file_exists($file)) {
                            unlink($file);
                            Log::info("Deleted old backup file: {$file}");
                        }
                    }
                    $run->delete();
                });

            // Limpiar archivos temporales
            $tmpFiles = File::files($this->tmpDir);
            foreach ($tmpFiles as $file) {
                if ($file->getMTime() < $cutoffDate->timestamp) {
                    unlink($file);
                    Log::info("Deleted old temp file: " . $file->getPathname());
                }
            }

            // Intentar limpiar en Google Drive (si está configurado)
            try {
                $this->cleanupDriveRetention($settings, $cutoffDate);
            } catch (\Exception $e) {
                Log::warning("Drive cleanup failed (non-critical): {$e->getMessage()}");
            }

            Log::info("Cleanup completed");
        } catch (\Exception $e) {
            Log::error("Retention cleanup failed: {$e->getMessage()}");
            // No lanzar excepción, es limpieza no-crítica
        }
    }

    /**
     * Limpiar archivos antiguos en Google Drive.
     */
    private function cleanupDriveRetention(BackupSetting $settings, Carbon $cutoffDate): void
    {
        // Usar rclone para listar y eliminar archivos antiguos
        $command = "rclone ls " . escapeshellarg($settings->drive_remote);
        $result = Process::run($command);

        if ($result->failed()) {
            throw new \Exception("rclone ls failed: " . $result->errorOutput());
        }

        $lines = explode("\n", trim($result->output()));
        foreach ($lines as $line) {
            if (empty($line)) {
                continue;
            }

            // Formato: "size  filename"
            $parts = preg_split('/\s+/', $line, 2);
            if (count($parts) < 2) {
                continue;
            }

            $fileName = $parts[1];

            // Intentar extraer fecha del nombre (formato: backup_bodas_YYYY-mm-dd_HH-ii-ss.tar.gz)
            if (preg_match('/backup_bodas_(\d{4})-(\d{2})-(\d{2})/', $fileName, $matches)) {
                $fileDate = Carbon::createFromFormat('Y-m-d', "{$matches[1]}-{$matches[2]}-{$matches[3]}", $settings->timezone);
                
                if ($fileDate < $cutoffDate) {
                    $deleteCommand = "rclone delete " . escapeshellarg($settings->drive_remote . '/' . $fileName);
                    $deleteResult = Process::run($deleteCommand);

                    if (!$deleteResult->failed()) {
                        Log::info("Deleted old file from Drive: {$fileName}");
                    } else {
                        Log::warning("Failed to delete from Drive: {$fileName}");
                    }
                }
            }
        }
    }

    /**
     * Verificar conexión con Google Drive (rclone).
     */
    public static function verifyDriveConnection(string $driveRemote): bool
    {
        try {
            $command = "rclone lsd " . escapeshellarg($driveRemote);
            $result = Process::run($command);

            return !$result->failed();
        } catch (\Exception $e) {
            Log::error("Drive connection verification failed: {$e->getMessage()}");
            return false;
        }
    }

    /**
     * Obtener espacio libre en Drive (aproximado).
     */
    public static function getDriveUsage(string $driveRemote): array
    {
        try {
            $command = "rclone about " . escapeshellarg($driveRemote);
            $result = Process::run($command);

            if ($result->failed()) {
                return ['total' => 0, 'used' => 0, 'free' => 0];
            }

            // Parse: "Total:   X Bytes\nUsed:    Y Bytes\nFree:    Z Bytes"
            $output = $result->output();
            preg_match('/Total:\s+(\d+)\s/', $output, $totalMatch);
            preg_match('/Used:\s+(\d+)\s/', $output, $usedMatch);
            preg_match('/Free:\s+(\d+)\s/', $output, $freeMatch);

            return [
                'total' => intval($totalMatch[1] ?? 0),
                'used' => intval($usedMatch[1] ?? 0),
                'free' => intval($freeMatch[1] ?? 0),
            ];
        } catch (\Exception $e) {
            Log::error("Drive usage check failed: {$e->getMessage()}");
            return ['total' => 0, 'used' => 0, 'free' => 0];
        }
    }
}
