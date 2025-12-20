<?php

namespace App\Listeners;

use App\Models\LogAuditoria;
use Illuminate\Auth\Events\PasswordReset;

/**
 * Listener para registrar restablecimientos de contraseña
 */
class RegistrarPasswordReset
{
    /**
     * Handle the event.
     */
    public function handle(PasswordReset $event): void
    {
        $usuario = $event->user;
        
        LogAuditoria::registrar(
            usuario_id: $usuario->id,
            accion: 'autenticacion.password_reset',
            descripcion: "Restablecimiento de contraseña para {$usuario->name}",
            nivel: 'MEDIO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'usuario_id' => $usuario->id,
                'email' => $usuario->email,
            ],
            entidad_tipo: get_class($usuario),
            entidad_id: $usuario->id
        );
    }
}
