<?php

namespace App\Observers;

use App\Models\Boda;
use App\Models\LogAuditoria;

/**
 * Observer para registrar cambios en el modelo Boda
 */
class BodaObserver
{
    /**
     * Handle the Boda "created" event.
     */
    public function created(Boda $boda): void
    {
        LogAuditoria::registrar(
            usuario_id: $boda->usuario_id,
            accion: 'boda.creada',
            descripcion: "Se creó la boda '{$boda->nombre_novia} & {$boda->nombre_novio}'",
            nivel: 'INFO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'boda_id' => $boda->id,
                'fecha_evento' => $boda->fecha_evento?->format('Y-m-d'),
                'slug' => $boda->slug,
            ],
            entidad_tipo: Boda::class,
            entidad_id: $boda->id
        );
    }

    /**
     * Handle the Boda "updated" event.
     */
    public function updated(Boda $boda): void
    {
        // Obtener los cambios realizados
        $cambios = $boda->getChanges();
        
        // Ignorar timestamps automáticos
        unset($cambios['updated_at']);
        
        if (empty($cambios)) {
            return;
        }
        
        // Obtener valores anteriores
        $valoresAnteriores = [];
        foreach (array_keys($cambios) as $campo) {
            $valoresAnteriores[$campo] = $boda->getOriginal($campo);
        }
        
        LogAuditoria::registrar(
            usuario_id: $boda->usuario_id ?? auth()->id(),
            accion: 'boda.actualizada',
            descripcion: "Se actualizó la boda '{$boda->nombre_novia} & {$boda->nombre_novio}'",
            nivel: 'INFO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'boda_id' => $boda->id,
                'cambios' => $cambios,
                'valores_anteriores' => $valoresAnteriores,
                'campos_modificados' => array_keys($cambios),
            ],
            entidad_tipo: Boda::class,
            entidad_id: $boda->id
        );
    }

    /**
     * Handle the Boda "deleted" event.
     */
    public function deleted(Boda $boda): void
    {
        LogAuditoria::registrar(
            usuario_id: auth()->id(),
            accion: 'boda.eliminada',
            descripcion: "Se eliminó la boda '{$boda->nombre_novia} & {$boda->nombre_novio}'",
            nivel: 'CRITICO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'boda_id' => $boda->id,
                'slug' => $boda->slug,
                'fecha_evento' => $boda->fecha_evento?->format('Y-m-d'),
                'total_invitados' => $boda->invitados()->count(),
            ],
            entidad_tipo: Boda::class,
            entidad_id: $boda->id
        );
    }

    /**
     * Handle the Boda "restored" event.
     */
    public function restored(Boda $boda): void
    {
        LogAuditoria::registrar(
            usuario_id: auth()->id(),
            accion: 'boda.restaurada',
            descripcion: "Se restauró la boda '{$boda->nombre_novia} & {$boda->nombre_novio}'",
            nivel: 'MEDIO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'boda_id' => $boda->id,
                'slug' => $boda->slug,
            ],
            entidad_tipo: Boda::class,
            entidad_id: $boda->id
        );
    }

    /**
     * Handle the Boda "force deleted" event.
     */
    public function forceDeleted(Boda $boda): void
    {
        LogAuditoria::registrar(
            usuario_id: auth()->id(),
            accion: 'boda.eliminada_permanente',
            descripcion: "Se eliminó permanentemente la boda '{$boda->nombre_novia} & {$boda->nombre_novio}'",
            nivel: 'CRITICO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'boda_id' => $boda->id,
                'slug' => $boda->slug,
            ],
            entidad_tipo: Boda::class,
            entidad_id: $boda->id
        );
    }
}
