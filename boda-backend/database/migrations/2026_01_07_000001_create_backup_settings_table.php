<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('backup_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('enabled')->default(false);
            $table->string('timezone')->default('America/Lima');
            $table->json('schedule_days')->comment('["mon", "tue", "wed", "thu", "fri", "sat", "sun"]');
            $table->json('schedule_times')->comment('["02:00", "14:30"]');
            $table->integer('retention_days')->default(30)->comment('Retener backups por N días');
            $table->boolean('include_db')->default(true);
            $table->boolean('include_fotos')->default(true);
            $table->boolean('include_tarjetas')->default(true);
            $table->string('drive_provider')->default('rclone_gdrive');
            $table->string('drive_remote')->default('gdrive:mi-boda/backups')->comment('Ej: gdrive:mi-boda/backups');
            $table->unsignedInteger('max_backup_size_mb')->nullable();
            $table->timestamp('last_run_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('backup_settings');
    }
};
