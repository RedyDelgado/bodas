<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Ejecutar las migraciones.
     */
    public function up(): void
    {
        Schema::create('metricas_plataforma', function (Blueprint $table) {
            $table->id();
            $table->date('fecha')->unique(); // Fecha de las métricas
            $table->unsignedInteger('total_usuarios')->default(0); // Total de usuarios registrados
            $table->unsignedInteger('usuarios_activos')->default(0); // Usuarios activos en el día
            $table->unsignedInteger('total_bodas')->default(0); // Total de bodas creadas
            $table->unsignedInteger('bodas_activas')->default(0); // Bodas con estado activa
            $table->decimal('ingresos_dia', 10, 2)->default(0); // Ingresos del día
            $table->unsignedInteger('conversiones')->default(0); // Bodas gratis -> premium
            $table->unsignedInteger('invitaciones_enviadas')->default(0); // Total de invitaciones enviadas
            $table->unsignedInteger('confirmaciones_recibidas')->default(0); // Total de confirmaciones
            $table->unsignedInteger('visitas_publicas')->default(0); // Visitas a páginas públicas
            $table->timestamps();
            
            // Índice para búsquedas por fecha
            $table->index('fecha');
        });
    }

    /**
     * Revertir las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('metricas_plataforma');
    }
};
