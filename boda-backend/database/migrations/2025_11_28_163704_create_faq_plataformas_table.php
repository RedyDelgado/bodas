<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('faqs_plataforma', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('orden')->default(1);
            $table->string('pregunta', 255);
            $table->text('respuesta');
            $table->boolean('es_activa')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('faqs_plataforma');
    }
};
