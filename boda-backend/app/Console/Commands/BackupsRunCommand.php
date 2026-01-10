<?php

namespace App\Console\Commands;

use App\Jobs\RunBackupJob;
use Illuminate\Console\Command;

class BackupsRunCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'backups:run {--manual : Flag indicating manual execution}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Run backup job (database, files, and upload to Google Drive)';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $manual = $this->option('manual') ?? false;

        $this->info("Dispatching RunBackupJob (manual: " . ($manual ? 'yes' : 'no') . ")");

        // Despachar job (usa queue por defecto)
        RunBackupJob::dispatch($manual);

        $this->info("Job dispatched successfully!");

        return self::SUCCESS;
    }
}
