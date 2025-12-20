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
        Schema::create('ips_bloqueadas', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address', 50)->unique(); // Dirección IP bloqueada
            $table->string('razon', 255); // Razón del bloqueo
            $table->foreignId('bloqueado_por')->nullable()->constrained('users')->onDelete('set null'); // Quién bloqueó
            $table->timestamp('bloqueado_hasta')->nullable(); // Bloqueo temporal o permanente
            $table->unsignedInteger('intentos_fallidos')->default(0); // Contador de intentos fallidos
            $table->text('notas')->nullable(); // Notas adicionales
            $table->boolean('activo')->default(true); // Si el bloqueo está activo
            $table->timestamps();
            
            // Índices para búsquedas rápidas
            $table->index('ip_address');
            $table->index(['activo', 'bloqueado_hasta']);
        });
    }

    /**
     * Revertir las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('ips_bloqueadas');
    }
};
