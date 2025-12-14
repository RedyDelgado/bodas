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

        if (!$rolSuperadmin || !$rolAdminBoda) {
            $this->command?->warn("Faltan roles (superadmin/admin_boda). Ejecuta RolesSeeder primero.");
            return;
        }

        if (!$planSub || !$planDominio) {
            $this->command?->warn("Faltan planes (subdominio/dominio-propio). Ejecuta PlanesSeeder primero.");
            return;
        }

        if ($plantillas->count() === 0) {
            $this->command?->warn("No hay plantillas. Ejecuta PlantillasSeeder primero.");
            return;
        }

        // Superadmin
        User::updateOrCreate(
            ['email' => 'redy.delgado@gmail.com'],
            [
                'name' => 'Super Administrador',
                'password' => Hash::make('123'),
                'rol_id' => $rolSuperadmin->id,
                'telefono' => '999999999',
                'activo' => true,
            ]
        );

        // Coordenadas base Quillabamba (solo para armar links coherentes)
        $baseLat = -12.866500;
        $baseLng = -72.694500;

        for ($i = 1; $i <= 5; $i++) {

            $nombrePareja = $faker->firstName() . ' & ' . $faker->firstName();
            $subdominio = Str::slug($nombrePareja . '-' . $i);

            $user = User::updateOrCreate(
                ['email' => "admin{$i}@bodas.test"],
                [
                    'name' => "Admin {$nombrePareja}",
                    'password' => Hash::make('123'),
                    'rol_id' => $rolAdminBoda->id,
                    'telefono' => $faker->phoneNumber(),
                    'activo' => true,
                ]
            );

            $plan = $i <= 2 ? $planDominio : $planSub;
            $plantilla = $plantillas->random();

            $usaDominioPropio = $plan->slug === 'dominio-propio';
            $dominioPersonalizado = $usaDominioPropio ? "{$subdominio}.com" : null;

            $boda = Boda::updateOrCreate(
                ['subdominio' => $subdominio],
                [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'plantilla_id' => $plantilla->id,
                    'nombre_pareja' => $nombrePareja,
                    'nombre_novio_1' => $faker->firstName() . ' ' . $faker->lastName(),
                    'nombre_novio_2' => $faker->firstName() . ' ' . $faker->lastName(),
                    'correo_contacto' => "contacto{$i}@bodas.test",
                    'fecha_boda' => $faker->dateTimeBetween('+1 month', '+12 months'),
                    'ciudad' => $faker->city(),

                    'dominio_personalizado' => $dominioPersonalizado,
                    'usa_subdominio' => true,
                    'usa_dominio_personalizado' => $usaDominioPropio,
                    'dominio_verificado_at' => $usaDominioPropio ? now() : null,

                    'url_publica_cache' => $usaDominioPropio
                        ? "https://{$dominioPersonalizado}"
                        : "https://{$subdominio}.miwebdebodas.test",

                    'estado' => 'activa',
                    'total_invitados' => 0,
                    'total_confirmados' => 0,
                    'total_vistas' => $faker->numberBetween(50, 500),
                    'fecha_publicacion' => now()->subDays($faker->numberBetween(1, 60)),
                ]
            );

            // Links Maps (solo url)
            $cerLat = $baseLat + $faker->randomFloat(6, -0.010000, 0.010000);
            $cerLng = $baseLng + $faker->randomFloat(6, -0.010000, 0.010000);
            $recLat = $baseLat + $faker->randomFloat(6, -0.010000, 0.010000);
            $recLng = $baseLng + $faker->randomFloat(6, -0.010000, 0.010000);

            $cerMaps = "https://www.google.com/maps?q={$cerLat},{$cerLng}";
            $recMaps = "https://www.google.com/maps?q={$recLat},{$recLng}";

            ConfiguracionBoda::updateOrCreate(
                ['boda_id' => $boda->id],
                [
                    'frase_principal' => 'Un día para celebrar el amor',
                    'texto_fecha_religioso' => 'Ceremonia religiosa: ' . $faker->dateTimeBetween('+1 month', '+12 months')->format('d/m/Y H:i'),
                    'texto_fecha_civil' => 'Ceremonia civil: ' . $faker->dateTimeBetween('+1 month', '+12 months')->format('d/m/Y H:i'),

                    'cronograma_texto' => "MATRIMONIO: 4:00 p. m.\nRECEPCIÓN: 6:00 p. m.\nCENA: 8:00 p. m.\nCELEBRACIÓN: 9:30 p. m.",

                    'local_religioso' => 'Parroquia ' . $faker->streetName(),
                    'local_recepcion' => 'Recepciones ' . $faker->company(),

                    'ceremonia_maps_url' => $cerMaps,
                    'recepcion_maps_url' => $recMaps,

                    'texto_cuentas_bancarias' => "BCP: 123-4567890-{$i}\nCCI: 002-123-4567890-{$i}",
                    'texto_yape' => 'Yape al número ' . $faker->phoneNumber(),

                    'texto_historia_pareja' => $faker->paragraph(3),
                    'texto_mensaje_final' => 'Gracias por acompañarnos en este día tan especial.',
                ]
            );

            if (FotoBoda::where('boda_id', $boda->id)->count() === 0) {
                for ($f = 1; $f <= 4; $f++) {
                    FotoBoda::create([
                        'boda_id' => $boda->id,
                        'url_imagen' => "/img/demo/boda{$i}-{$f}.jpg",
                        'titulo' => "Foto {$f} de la boda {$i}",
                        'descripcion' => $faker->sentence(),
                        'orden' => $f,
                        'es_portada' => $f === 1,
                        'es_galeria_privada' => false,
                    ]);
                }
            }

            if (Invitado::where('boda_id', $boda->id)->count() === 0) {
                $totalInvitados = 20;
                $confirmados = 0;

                for ($j = 1; $j <= $totalInvitados; $j++) {
                    $confirmado = $faker->boolean(60);
                    if ($confirmado) $confirmados++;

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
}
