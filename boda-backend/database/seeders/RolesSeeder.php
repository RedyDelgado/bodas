<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Role;

class RolesSeeder extends Seeder
{
    public function run(): void
    {
        Role::updateOrCreate(
            ['nombre' => 'superadmin'],
            ['descripcion' => 'Administrador general de la plataforma']
        );

        Role::updateOrCreate(
            ['nombre' => 'admin_boda'],
            ['descripcion' => 'Administrador de una boda específica']
        );
    }
}
