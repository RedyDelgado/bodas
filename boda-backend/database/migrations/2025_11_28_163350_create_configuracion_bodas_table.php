<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('configuracion_boda', function (Blueprint $table) {
            $table->id();

            // 1 a 1: una configuración por boda
            $table->foreignId('boda_id')
                ->constrained('bodas')
                ->cascadeOnDelete()
                ->unique();

            // Portada / fechas
            $table->string('frase_principal', 255)->nullable();
            $table->string('texto_fecha_religioso', 255)->nullable();
            $table->string('texto_fecha_civil', 255)->nullable();

            // Padres / padrinos
            $table->text('texto_padres_novio')->nullable();
            $table->text('texto_padres_novia')->nullable();
            $table->text('texto_padrinos_mayores')->nullable();
            $table->text('texto_padrinos_civiles')->nullable();

            // Lugares / cronograma
            $table->text('cronograma_texto')->nullable();
            $table->string('local_religioso', 255)->nullable();
            $table->string('local_recepcion', 255)->nullable();

            // SOLO URLS DE GOOGLE MAPS (simple)
            $table->string('ceremonia_maps_url', 1024)->nullable();
            $table->string('recepcion_maps_url', 1024)->nullable();

            // Regalos
            $table->text('texto_cuentas_bancarias')->nullable();
            $table->text('texto_yape')->nullable();

            // Historia / cierre
            $table->text('texto_historia_pareja')->nullable();
            $table->text('texto_mensaje_final')->nullable();

            // (opcional si tu front ya lo manda)
            $table->text('texto_preguntas_frecuentes')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configuracion_boda');
    }
};
