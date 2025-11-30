<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bodas', function (Blueprint $table) {
            $table->id();

            // Relaciones
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('plan_id')->constrained('planes')->restrictOnDelete();
            $table->foreignId('plantilla_id')
                ->nullable()
                ->constrained('plantillas')
                ->nullOnDelete();

            // Datos principales de la boda
            $table->string('nombre_pareja', 150);
            $table->string('nombre_novio_1', 120);
            $table->string('nombre_novio_2', 120);
            $table->string('correo_contacto', 150);
            $table->date('fecha_boda');
            $table->string('ciudad', 120);

            // Dominio / subdominio
            $table->string('subdominio', 100)->unique();
            $table->string('dominio_personalizado', 150)
                ->nullable()
                ->unique();

            // Flags para lógica de publicación
            $table->boolean('usa_subdominio')->default(true);
            $table->boolean('usa_dominio_personalizado')->default(false);
            $table->timestamp('dominio_verificado_at')->nullable();

            // Cache de URL pública (puede apuntar a dominio o subdominio)
            $table->string('url_publica_cache', 255)->nullable();

            // Estado y métricas
            $table
                ->enum('estado', ['activa', 'borrador', 'suspendida'])
                ->default('borrador');

            $table->unsignedInteger('total_invitados')->default(0);
            $table->unsignedInteger('total_confirmados')->default(0);
            $table->unsignedBigInteger('total_vistas')->default(0);

            $table->dateTime('fecha_publicacion')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bodas');
    }
};
