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
        Schema::create('backup_runs', function (Blueprint $table) {
            $table->id();
            $table->timestamp('started_at');
            $table->timestamp('finished_at')->nullable();
            $table->enum('status', ['queued', 'running', 'success', 'failed'])->default('queued');
            $table->string('file_name')->nullable()->comment('Nombre del archivo de backup');
            $table->unsignedBigInteger('file_size_bytes')->nullable();
            $table->string('sha256')->nullable()->comment('Hash del archivo');
            $table->string('drive_path')->nullable()->comment('Ruta en Google Drive');
            $table->text('error_message')->nullable();
            $table->json('meta')->nullable()->comment('Duraciones, conteos, etc');
            $table->timestamps();

            // Índices para búsquedas frecuentes
            $table->index('status');
            $table->index('started_at');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('backup_runs');
    }
};
