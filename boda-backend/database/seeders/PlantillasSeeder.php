<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Plantilla;

class PlantillasSeeder extends Seeder
{
    public function run(): void
    {
        $plantillas = [
            [
                'nombre' => 'Azul acero & dorado',
                'slug' => 'azul-acero-dorado',
                'descripcion_corta' => 'Estilo elegante con tonos azul acero y dorado.',
                'preview_imagen_url' => '/img/plantillas/azul-acero-dorado.png',
            ],
            [
                'nombre' => 'Coral tropical',
                'slug' => 'coral-tropical',
                'descripcion_corta' => 'Colores cálidos y vibrantes, ideal para climas tropicales.',
                'preview_imagen_url' => '/img/plantillas/coral-tropical.png',
            ],
            [
                'nombre' => 'Verde esmeralda',
                'slug' => 'verde-esmeralda',
                'descripcion_corta' => 'Diseño sobrio con énfasis en la naturaleza.',
                'preview_imagen_url' => '/img/plantillas/verde-esmeralda.png',
            ],
        ];

        foreach ($plantillas as $data) {
            Plantilla::updateOrCreate(
                ['slug' => $data['slug']],
                $data + ['es_activa' => true]
            );
        }
    }
}
