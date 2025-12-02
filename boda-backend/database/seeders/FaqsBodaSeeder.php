<?php

namespace Database\Seeders;

use App\Models\Boda;
use App\Models\FaqBoda;
use Illuminate\Database\Seeder;

class FaqsBodaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Asegurarnos de que existan bodas
        $bodas = Boda::all();

        if ($bodas->isEmpty()) {
            $this->command->warn('No hay bodas registradas. Primero crea o seedéa algunas bodas.');
            return;
        }

        foreach ($bodas as $boda) {
            // Evitar duplicar FAQs si ya tuviera
            if ($boda->faqs()->exists()) {
                $this->command->info("La boda ID {$boda->id} ya tiene FAQs, se omite.");
                continue;
            }

            $preguntas = [
                [
                    'pregunta'  => '¿Hay código de vestimenta?',
                    'respuesta' => 'Sugerimos un estilo semi-formal. Colores claros y cómodos son bienvenidos.',
                ],
                [
                    'pregunta'  => '¿Pueden asistir niños?',
                    'respuesta' => 'Sí, los niños son bienvenidos. Agradeceremos que los supervisen durante toda la celebración.',
                ],
                [
                    'pregunta'  => '¿Habrá estacionamiento disponible?',
                    'respuesta' => 'Sí, el local cuenta con estacionamiento limitado. Recomendamos llegar con anticipación.',
                ],
                [
                    'pregunta'  => '¿A qué hora recomiendan llegar?',
                    'respuesta' => 'Recomendamos llegar al menos 20 minutos antes del inicio de la ceremonia.',
                ],
            ];

            foreach ($preguntas as $index => $faq) {
                FaqBoda::create([
                    'boda_id'   => $boda->id,
                    'orden'     => $index + 1,
                    'pregunta'  => $faq['pregunta'],
                    'respuesta' => $faq['respuesta'],
                    'es_activa' => true,
                ]);
            }

            $this->command->info("Se crearon FAQs de ejemplo para la boda ID {$boda->id}.");
        }
    }
}
