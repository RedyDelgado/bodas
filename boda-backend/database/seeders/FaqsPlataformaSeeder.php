<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\FaqPlataforma;

class FaqsPlataformaSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            [
                'orden' => 1,
                'pregunta' => '¿Puedo cambiar las fotos y textos de mi web de boda?',
                'respuesta' => 'Sí, desde tu panel de administrador puedes actualizar fotos, frases, cronograma y más en cualquier momento.',
            ],
            [
                'orden' => 2,
                'pregunta' => '¿Puedo usar mi propio dominio?',
                'respuesta' => 'Con el plan Dominio Propio puedes conectar tu dominio, por ejemplo: tusnombres.com.',
            ],
            [
                'orden' => 3,
                'pregunta' => '¿Los invitados necesitan registrarse?',
                'respuesta' => 'No. Solo reciben un enlace personalizado y pueden confirmar su asistencia con un par de clics.',
            ],
        ];

        foreach ($faqs as $faq) {
            FaqPlataforma::create($faq);
        }
    }
}
