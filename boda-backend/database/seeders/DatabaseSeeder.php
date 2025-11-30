<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesSeeder::class,
            PlanesSeeder::class,
            PlantillasSeeder::class,
            AjustesMarcaSeeder::class,
            FaqsPlataformaSeeder::class,
            UsuariosYBodasSeeder::class,
        ]);
    }
}
