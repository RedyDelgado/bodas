<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        Schema::create('tarjeta_disenos', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('boda_id')->index();
            $table->string('plantilla_ruta')->nullable();
            $table->json('diseno_json')->nullable();
            $table->string('estado_generacion')->nullable();
            $table->unsignedInteger('ultimo_conteo_generado')->default(0);
            $table->timestamp('ultima_generacion_at')->nullable();
            $table->string('ruta_vista_previa')->nullable();
            $table->unsignedBigInteger('creado_por')->nullable();
            $table->timestamps();

            $table->foreign('boda_id')->references('id')->on('bodas')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('tarjeta_disenos');
    }
};
