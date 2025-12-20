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
        Schema::create('logs_auditoria', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('accion', 100); // Acción realizada: login, crear_boda, editar_usuario, etc.
            $table->enum('nivel', ['CRITICO', 'MEDIO', 'INFO'])->default('INFO'); // Nivel de severidad
            $table->text('descripcion')->nullable(); // Descripción detallada del evento
            $table->string('ip_address', 50)->nullable(); // IP del usuario
            $table->text('user_agent')->nullable(); // Navegador y dispositivo
            $table->json('datos_adicionales')->nullable(); // Datos extra en formato JSON
            $table->string('entidad_tipo', 50)->nullable(); // Tipo de entidad afectada (Boda, Usuario, etc.)
            $table->unsignedBigInteger('entidad_id')->nullable(); // ID de la entidad afectada
            $table->timestamps();
            
            // Índices para búsquedas rápidas
            $table->index(['usuario_id', 'created_at']);
            $table->index('accion');
            $table->index('nivel');
            $table->index('ip_address');
        });
    }

    /**
     * Revertir las migraciones.
     */
    public function down(): void
    {
        Schema::dropIfExists('logs_auditoria');
    }
};
