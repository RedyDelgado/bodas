<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Faker\Factory as Faker;
use App\Models\{
    User,
    Role,
    Plan,
    Plantilla,
    Boda,
    ConfiguracionBoda,
    FotoBoda,
    Invitado
};

class UsuariosYBodasSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('es_PE');

        $rolSuperadmin = Role::where('nombre', 'superadmin')->first();
        $rolAdminBoda  = Role::where('nombre', 'admin_boda')->first();

        $planSub      = Plan::where('slug', 'subdominio')->first();
        $planDominio  = Plan::where('slug', 'dominio-propio')->first();
        $plantillas   = Plantilla::all();

        // Superadmin
        User::updateOrCreate(
            ['email' => 'redy.delgado@gmail.com'],
            [
                'name' => 'Super Administrador',
                'password' => Hash::make('123'),
                'rol_id' => $rolSuperadmin?->id,
                'telefono' => '999999999',
                'activo' => true,
            ]
        );

        // 5 bodas demo
        for ($i = 1; $i <= 5; $i++) {

            // Usuario admin_boda
            $nombrePareja = $faker->firstName() . ' & ' . $faker->firstName();

            $user = User::create([
                'name' => 'Admin ' . $nombrePareja,
                'email' => 'admin' . $i . '@bodas.test',
                'password' => Hash::make('123'),
                'rol_id' => $rolAdminBoda?->id,
                'telefono' => $faker->phoneNumber(),
                'activo' => true,
            ]);

            // Dentro del for de 5 bodas...
            $plan = $i <= 2 ? $planDominio : $planSub; // mezcla de planes
            $plantilla = $plantillas->random();

            $subdominio = Str::slug($nombrePareja . '-' . $i);

            $usaDominioPropio = $plan->slug === 'dominio-propio';

            $dominioPersonalizado = $usaDominioPropio
                ? $subdominio . '.com'
                : null;

            $boda = Boda::create([
                'user_id' => $user->id,
                'plan_id' => $plan->id,
                'plantilla_id' => $plantilla->id,
                'nombre_pareja' => $nombrePareja,
                'nombre_novio_1' => $faker->firstName() . ' ' . $faker->lastName(),
                'nombre_novio_2' => $faker->firstName() . ' ' . $faker->lastName(),
                'correo_contacto' => 'contacto' . $i . '@bodas.test',
                'fecha_boda' => $faker->dateTimeBetween('+1 month', '+12 months'),
                'ciudad' => $faker->city(),
                'subdominio' => $subdominio,

                'dominio_personalizado' => $dominioPersonalizado,
                'usa_subdominio' => true,
                'usa_dominio_personalizado' => $usaDominioPropio,
                'dominio_verificado_at' => $usaDominioPropio ? now() : null, // para demo, como si ya estuviera verificado

                'url_publica_cache' => $usaDominioPropio
                    ? 'https://' . $dominioPersonalizado
                    : 'https://' . $subdominio . '.miwebdebodas.test',

                'estado' => 'activa',
                'total_invitados' => 0,
                'total_confirmados' => 0,
                'total_vistas' => $faker->numberBetween(50, 500),
                'fecha_publicacion' => now()->subDays($faker->numberBetween(1, 60)),
            ]);


            // Configuración básica
            ConfiguracionBoda::create([
                'boda_id' => $boda->id,
                'frase_principal' => 'Un día para celebrar el amor',
                'texto_fecha_religioso' => 'Ceremonia religiosa: ' . $faker->dateTimeBetween('+1 month', '+12 months')->format('d/m/Y H:i'),
                'texto_fecha_civil' => 'Ceremonia civil: ' . $faker->dateTimeBetween('+1 month', '+12 months')->format('d/m/Y H:i'),
                'cronograma_texto' => "Recepción de invitados\nCeremonia\nBrindis\nBaile de los novios",
                'local_religioso' => 'Parroquia ' . $faker->streetName(),
                'local_recepcion' => 'Recepciones ' . $faker->company(),
                'texto_cuentas_bancarias' => "BCP: 123-4567890-" . $i . "\nCCI: 002-123-4567890-" . $i,
                'texto_yape' => 'Yape al número ' . $faker->phoneNumber(),
                'texto_historia_pareja' => $faker->paragraph(3),
                'texto_mensaje_final' => 'Gracias por acompañarnos en este día tan especial.',
            ]);

            // Algunas fotos
            for ($f = 1; $f <= 4; $f++) {
                FotoBoda::create([
                    'boda_id' => $boda->id,
                    'url_imagen' => '/img/demo/boda' . $i . '-' . $f . '.jpg',
                    'titulo' => 'Foto ' . $f . ' de la boda ' . $i,
                    'descripcion' => $faker->sentence(),
                    'orden' => $f,
                    'es_portada' => $f === 1,
                    'es_galeria_privada' => false,
                ]);
            }

            // Invitados: ~20 por boda → 5 bodas ≈ 100 invitados
            $totalInvitados = 20;
            $confirmados = 0;

            for ($j = 1; $j <= $totalInvitados; $j++) {
                $confirmado = $faker->boolean(60); // 60% confirmados

                if ($confirmado) {
                    $confirmados++;
                }

                Invitado::create([
                    'boda_id' => $boda->id,
                    'codigo_clave' => strtoupper(Str::random(8)),
                    'nombre_invitado' => $faker->name(),
                    'pases' => $faker->numberBetween(1, 3),
                    'correo' => $faker->safeEmail(),
                    'celular' => $faker->phoneNumber(),
                    'nombre_acompanante' => $faker->boolean(40) ? $faker->name() : null,
                    'es_confirmado' => $confirmado,
                    'fecha_confirmacion' => $confirmado ? $faker->dateTimeBetween('-30 days', 'now') : null,
                    'notas' => $faker->boolean(20) ? 'Invitado con restricciones alimentarias.' : null,
                ]);
            }

            $boda->update([
                'total_invitados' => $totalInvitados,
                'total_confirmados' => $confirmados,
            ]);
        }
    }
}
