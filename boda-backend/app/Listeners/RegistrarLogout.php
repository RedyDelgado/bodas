<?php

namespace App\Listeners;

use App\Models\LogAuditoria;
use Illuminate\Auth\Events\Logout;

/**
 * Listener para registrar cierres de sesión
 */
class RegistrarLogout
{
    /**
     * Handle the event.
     */
    public function handle(Logout $event): void
    {
        $usuario = $event->user;
        
        if (!$usuario) {
            return;
        }
        
        LogAuditoria::registrar(
            usuario_id: $usuario->id,
            accion: 'autenticacion.logout',
            descripcion: "Cierre de sesión de {$usuario->name}",
            nivel: 'INFO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'usuario_id' => $usuario->id,
                'email' => $usuario->email,
                'guard' => $event->guard,
            ],
            entidad_tipo: get_class($usuario),
            entidad_id: $usuario->id
        );
    }
}
