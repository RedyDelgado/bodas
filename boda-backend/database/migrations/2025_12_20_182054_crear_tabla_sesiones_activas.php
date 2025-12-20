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
        Schema::create('sesiones_activas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->string('token', 80)->unique(); // Token de sesión de Sanctum
            $table->string('ip_address', 50)->nullable(); // IP del usuario
            $table->text('user_agent')->nullable(); // Navegador y dispositivo
            $table->timestamp('ultima_actividad'); // Última actividad del usuario
            $table->timestamp('expires_at')->nullable(); // Cuándo expira la sesión
            $table->timestamps();
            
            // Índices para búsquedas rápidas
            $table->index(['usuario_id', 'ultima_actividad']);
            $table->index('token');
        });
    }

    /**
     * Revertir las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('sesiones_activas');
    }
};
