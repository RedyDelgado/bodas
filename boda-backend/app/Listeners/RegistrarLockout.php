<?php

namespace App\Listeners;

use App\Models\LogAuditoria;
use Illuminate\Auth\Events\Lockout;

/**
 * Listener para registrar bloqueos por múltiples intentos fallidos
 */
class RegistrarLockout
{
    /**
     * Handle the event.
     */
    public function handle(Lockout $event): void
    {
        $request = $event->request;
        
        LogAuditoria::registrar(
            usuario_id: null,
            accion: 'autenticacion.lockout',
            descripcion: "Cuenta bloqueada temporalmente por múltiples intentos fallidos",
            nivel: 'CRITICO',
            ip_address: $request->ip(),
            user_agent: $request->userAgent(),
            datos_adicionales: [
                'email' => $request->input('email'),
                'intentos' => 'Límite excedido',
            ],
            entidad_tipo: null,
            entidad_id: null
        );
    }
}
