<?php

namespace App\Listeners;

use App\Models\LogAuditoria;
use Illuminate\Auth\Events\Login;

/**
 * Listener para registrar inicios de sesión exitosos
 */
class RegistrarLoginExitoso
{
    /**
     * Handle the event.
     */
    public function handle(Login $event): void
    {
        $usuario = $event->user;
        
        LogAuditoria::registrar(
            usuario_id: $usuario->id,
            accion: 'autenticacion.login',
            descripcion: "Inicio de sesión exitoso de {$usuario->name}",
            nivel: 'INFO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'usuario_id' => $usuario->id,
                'email' => $usuario->email,
                'rol' => $usuario->rol?->nombre,
                'guard' => $event->guard,
            ],
            entidad_tipo: get_class($usuario),
            entidad_id: $usuario->id
        );

        // Actualizar last_login_at
        $usuario->update(['last_login_at' => now()]);
    }
}
