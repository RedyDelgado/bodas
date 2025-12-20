<?php

namespace App\Observers;

use App\Models\User;
use App\Models\LogAuditoria;

/**
 * Observer para registrar cambios en el modelo User
 */
class UsuarioObserver
{
    /**
     * Handle the User "created" event.
     */
    public function created(User $usuario): void
    {
        LogAuditoria::registrar(
            usuario_id: auth()->id(), // Quien creó al usuario (puede ser null en registro)
            accion: 'usuario.creado',
            descripcion: "Se registró el usuario '{$usuario->name}' ({$usuario->email})",
            nivel: 'INFO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'usuario_id' => $usuario->id,
                'nombre' => $usuario->name,
                'email' => $usuario->email,
                'rol_id' => $usuario->rol_id,
            ],
            entidad_tipo: User::class,
            entidad_id: $usuario->id
        );
    }

    /**
     * Handle the User "updated" event.
     */
    public function updated(User $usuario): void
    {
        $cambios = $usuario->getChanges();
        
        // Ignorar timestamps y remember_token
        unset($cambios['updated_at'], $cambios['remember_token'], $cambios['last_login_at']);
        
        if (empty($cambios)) {
            return;
        }
        
        $valoresAnteriores = [];
        foreach (array_keys($cambios) as $campo) {
            $valoresAnteriores[$campo] = $usuario->getOriginal($campo);
        }
        
        // Ocultar contraseñas en logs
        if (isset($cambios['password'])) {
            $cambios['password'] = '***';
            $valoresAnteriores['password'] = '***';
        }
        
        // Determinar nivel según tipo de cambio
        $nivel = 'INFO';
        if (isset($cambios['suspendido']) || isset($cambios['rol_id'])) {
            $nivel = 'CRITICO';
        } elseif (isset($cambios['password'])) {
            $nivel = 'MEDIO';
        }
        
        LogAuditoria::registrar(
            usuario_id: auth()->id() ?? $usuario->id,
            accion: 'usuario.actualizado',
            descripcion: "Se actualizó el usuario '{$usuario->name}'",
            nivel: $nivel,
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'usuario_id' => $usuario->id,
                'cambios' => $cambios,
                'valores_anteriores' => $valoresAnteriores,
                'campos_modificados' => array_keys($cambios),
            ],
            entidad_tipo: User::class,
            entidad_id: $usuario->id
        );
    }

    /**
     * Handle the User "deleted" event.
     */
    public function deleted(User $usuario): void
    {
        LogAuditoria::registrar(
            usuario_id: auth()->id(),
            accion: 'usuario.eliminado',
            descripcion: "Se eliminó el usuario '{$usuario->name}' ({$usuario->email})",
            nivel: 'CRITICO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'usuario_id' => $usuario->id,
                'nombre' => $usuario->name,
                'email' => $usuario->email,
                'total_bodas' => $usuario->bodas()->count(),
            ],
            entidad_tipo: User::class,
            entidad_id: $usuario->id
        );
    }

    /**
     * Handle the User "restored" event.
     */
    public function restored(User $usuario): void
    {
        LogAuditoria::registrar(
            usuario_id: auth()->id(),
            accion: 'usuario.restaurado',
            descripcion: "Se restauró el usuario '{$usuario->name}'",
            nivel: 'MEDIO',
            ip_address: request()->ip(),
            user_agent: request()->userAgent(),
            datos_adicionales: [
                'usuario_id' => $usuario->id,
                'email' => $usuario->email,
            ],
            entidad_tipo: User::class,
            entidad_id: $usuario->id
        );
    }
}
