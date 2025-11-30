<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fotos_boda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('boda_id')->constrained('bodas');
            $table->string('url_imagen', 255);
            $table->string('titulo', 150)->nullable();
            $table->string('descripcion', 255)->nullable();
            $table->unsignedInteger('orden')->default(1);
            $table->boolean('es_portada')->default(false);
            $table->boolean('es_galeria_privada')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fotos_boda');
    }
};
