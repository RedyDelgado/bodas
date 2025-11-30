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
            $table->foreignId('boda_id')->constrained('bodas')->unique();

            $table->string('frase_principal', 255)->nullable();
            $table->string('texto_fecha_religioso', 255)->nullable();
            $table->string('texto_fecha_civil', 255)->nullable();

            $table->text('texto_padres_novio')->nullable();
            $table->text('texto_padres_novia')->nullable();
            $table->text('texto_padrinos_mayores')->nullable();
            $table->text('texto_padrinos_civiles')->nullable();

            $table->text('cronograma_texto')->nullable();
            $table->string('local_religioso', 255)->nullable();
            $table->string('local_recepcion', 255)->nullable();

            $table->text('texto_cuentas_bancarias')->nullable();
            $table->text('texto_yape')->nullable();

            $table->text('texto_historia_pareja')->nullable();
            $table->text('texto_mensaje_final')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('configuracion_boda');
    }
};
