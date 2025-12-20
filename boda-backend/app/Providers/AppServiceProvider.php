<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Boda;
use App\Models\Invitado;
use App\Models\User;
use App\Observers\BodaObserver;
use App\Observers\InvitadoObserver;
use App\Observers\UsuarioObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Registrar observers para auditoría automática
        Boda::observe(BodaObserver::class);
        Invitado::observe(InvitadoObserver::class);
        User::observe(UsuarioObserver::class);
    }
}
