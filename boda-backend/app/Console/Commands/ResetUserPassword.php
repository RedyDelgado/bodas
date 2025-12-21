<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ResetUserPassword extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'user:reset-password {email} {password} {--activate}';

    /**
     * The console command description.
     */
    protected $description = 'Resetea la contraseña de un usuario y opcionalmente lo activa';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = (string) $this->argument('email');
        $password = (string) $this->argument('password');
        $activate = (bool) $this->option('activate');

        /** @var User|null $user */
        $user = User::where('email', $email)->first();
        if (! $user) {
            $this->error('Usuario no encontrado: '.$email);
            return 1;
        }

        $user->password = Hash::make($password);
        if ($activate) {
            $user->activo = true;
        }
        $user->save();

        $this->info('Contraseña actualizada correctamente para: '.$email.
            ($activate ? ' (usuario activado)' : '')
        );
        return 0;
    }
}
