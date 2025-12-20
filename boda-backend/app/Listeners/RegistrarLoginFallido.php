<?php

namespace App\Listeners;

use App\Models\LogAuditoria;
use Illuminate\Auth\Events\Failed;

/**
 * Listener para registrar intentos de login fallidos
 */
class RegistrarLoginFallido
{
    /**
     * Handle the event.
     */
    public function handle(Failed $event): void
    {
        $credentials = $event->credentials;
        
        LogAuditoria::registrar(
            usuario_id: null, // No hay usuario autenticado
            accion: 'autenticacion.login_fallido',
            descripcion: "Intento de inicio de sesión fallido para {$credentials['email']}",
            nivel: 'MEDIO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'email' => $credentials['email'],
                'guard' => $event->guard,
                'razon' => 'Credenciales inválidas',
            ],
            entidad_tipo: null,
            entidad_id: null
        );
    }
}
