<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('planes', function (Blueprint $table) {
            $table->id();
            $table->string('nombre', 100);
            $table->string('slug', 50)->unique();
            $table->string('descripcion_corta', 255)->nullable();
            $table->decimal('precio_monetario', 10, 2)->nullable();
            $table->string('moneda', 10)->default('PEN');
            $table->boolean('incluye_subdominio')->default(true);
            $table->boolean('permite_dominio_propio')->default(false);
            $table->boolean('invitados_ilimitados')->default(true);
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('planes');
    }
};
