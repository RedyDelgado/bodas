<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanesSeeder extends Seeder
{
    public function run(): void
    {
        Plan::updateOrCreate(
            ['slug' => 'subdominio'],
            [
                'nombre' => 'Plan Subdominio',
                'descripcion_corta' => 'Crea tu web con subdominio gratuito',
                'precio_monetario' => 0,
                'moneda' => 'PEN',
                'incluye_subdominio' => true,
                'permite_dominio_propio' => false,
                'invitados_ilimitados' => true,
                'activo' => true,
            ]
        );

        Plan::updateOrCreate(
            ['slug' => 'dominio-propio'],
            [
                'nombre' => 'Plan Dominio Propio',
                'descripcion_corta' => 'Usa tu propio dominio para tu boda',
                'precio_monetario' => 150.00,
                'moneda' => 'PEN',
                'incluye_subdominio' => true,
                'permite_dominio_propio' => true,
                'invitados_ilimitados' => true,
                'activo' => true,
            ]
        );
    }
}
