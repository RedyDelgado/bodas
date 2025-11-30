<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ajustes_marca', function (Blueprint $table) {
            $table->id();
            $table->string('nombre_plataforma', 150);
            $table->string('logo_url', 255)->nullable();
            $table->string('color_principal', 7)->default('#2C3E50');
            $table->string('color_secundario', 7)->default('#E67E22');
            $table->string('color_acento', 7)->default('#F1C40F');
            $table->longText('texto_politica_privacidad')->nullable();
            $table->longText('texto_terminos_condiciones')->nullable();
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ajustes_marca');
    }
};
