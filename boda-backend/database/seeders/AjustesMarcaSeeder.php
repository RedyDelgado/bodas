<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AjusteMarca;

class AjustesMarcaSeeder extends Seeder
{
    public function run(): void
    {
        AjusteMarca::create([
            'nombre_plataforma' => 'Mi Web de Bodas',
            'logo_url' => '/img/logo-bodas.svg',
            'color_principal' => '#1F3C88',
            'color_secundario' => '#F2A365',
            'color_acento' => '#FFFFFF',
            'texto_politica_privacidad' => 'Texto de ejemplo de política de privacidad...',
            'texto_terminos_condiciones' => 'Texto de ejemplo de términos y condiciones...',
            'activo' => true,
        ]);
    }
}
