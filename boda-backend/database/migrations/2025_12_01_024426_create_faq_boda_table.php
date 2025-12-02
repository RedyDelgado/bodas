<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('faqs_boda', function (Blueprint $table) {
            $table->id();

            // Cada FAQ pertenece a una boda
            $table->unsignedBigInteger('boda_id');

            // Para ordenar las preguntas en la web
            $table->unsignedInteger('orden')->default(1);

            $table->string('pregunta', 255);
            $table->text('respuesta');

            // Para activar/desactivar sin borrar
            $table->boolean('es_activa')->default(true);

            $table->timestamps();

            $table->foreign('boda_id')
                ->references('id')
                ->on('bodas')
                ->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('faqs_boda');
    }
};
