<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('logs_whatsapp_envios', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invitado_id')->constrained('invitados');
            $table->string('telefono_enviado', 30);
            $table->text('contenido_mensaje');
            $table->string('estado_envio', 30)->default('pendiente');
            $table->text('respuesta_gateway')->nullable();
            $table->dateTime('enviado_en')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('logs_whatsapp_envios');
    }
};
