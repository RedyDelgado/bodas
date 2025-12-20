<?php

namespace App\Observers;

use App\Models\Invitado;
use App\Models\LogAuditoria;

/**
 * Observer para registrar cambios en el modelo Invitado
 */
class InvitadoObserver
{
    /**
     * Handle the Invitado "created" event.
     */
    public function created(Invitado $invitado): void
    {
        $boda = $invitado->boda;
        
        LogAuditoria::registrar(
            usuario_id: $boda?->usuario_id ?? auth()->id(),
            accion: 'invitado.creado',
            descripcion: "Se agregó el invitado '{$invitado->nombre}' a la boda",
            nivel: 'INFO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'invitado_id' => $invitado->id,
                'boda_id' => $invitado->boda_id,
                'nombre' => $invitado->nombre,
                'email' => $invitado->email,
                'telefono' => $invitado->telefono,
            ],
            entidad_tipo: Invitado::class,
            entidad_id: $invitado->id
        );
    }

    /**
     * Handle the Invitado "updated" event.
     */
    public function updated(Invitado $invitado): void
    {
        $cambios = $invitado->getChanges();
        unset($cambios['updated_at']);
        
        if (empty($cambios)) {
            return;
        }
        
        $valoresAnteriores = [];
        foreach (array_keys($cambios) as $campo) {
            $valoresAnteriores[$campo] = $invitado->getOriginal($campo);
        }
        
        $boda = $invitado->boda;
        
        LogAuditoria::registrar(
            usuario_id: $boda?->usuario_id ?? auth()->id(),
            accion: 'invitado.actualizado',
            descripcion: "Se actualizó el invitado '{$invitado->nombre}'",
            nivel: 'INFO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'invitado_id' => $invitado->id,
                'boda_id' => $invitado->boda_id,
                'cambios' => $cambios,
                'valores_anteriores' => $valoresAnteriores,
                'campos_modificados' => array_keys($cambios),
            ],
            entidad_tipo: Invitado::class,
            entidad_id: $invitado->id
        );
    }

    /**
     * Handle the Invitado "deleted" event.
     */
    public function deleted(Invitado $invitado): void
    {
        $boda = $invitado->boda;
        
        LogAuditoria::registrar(
            usuario_id: $boda?->usuario_id ?? auth()->id(),
            accion: 'invitado.eliminado',
            descripcion: "Se eliminó el invitado '{$invitado->nombre}'",
            nivel: 'MEDIO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'invitado_id' => $invitado->id,
                'boda_id' => $invitado->boda_id,
                'nombre' => $invitado->nombre,
                'email' => $invitado->email,
            ],
            entidad_tipo: Invitado::class,
            entidad_id: $invitado->id
        );
    }
}
