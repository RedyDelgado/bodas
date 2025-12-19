<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invitados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boda_id')->constrained('bodas');

            $table->string('codigo_clave', 50);
            $table->string('nombre_invitado', 150);
            $table->unsignedTinyInteger('pases')->default(1);

            $table->string('correo', 150)->nullable();
            $table->string('celular', 30)->nullable();
            $table->string('nombre_acompanante', 150)->nullable();

            $table->boolean('es_confirmado')->default(false);
            $table->dateTime('fecha_confirmacion')->nullable();

            $table->string('notas', 255)->nullable();

            // ✅ RSVP card cache (SIN after)
            $table->string('rsvp_card_path', 255)->nullable();
            $table->string('rsvp_card_hash', 64)->nullable();
            $table->timestamp('rsvp_card_generated_at')->nullable();

            $table->timestamps();

            $table->unique(['boda_id', 'codigo_clave']);

            // índices opcionales
            $table->index('rsvp_card_hash');
            $table->index('rsvp_card_generated_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invitados');
    }
};
