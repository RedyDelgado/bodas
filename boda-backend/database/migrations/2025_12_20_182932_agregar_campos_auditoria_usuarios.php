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
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('suspendido')->default(false)->after('activo');
            $table->string('razon_suspension')->nullable()->after('suspendido');
            $table->timestamp('last_login_at')->nullable()->after('razon_suspension');
        });
    }

    /**
     * Revertir las migraciones.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['suspendido', 'razon_suspension', 'last_login_at']);
        });
    }
};
