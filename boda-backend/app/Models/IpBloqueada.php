<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class IpBloqueada extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla
     */
    protected $table = 'ips_bloqueadas';

    /**
     * Campos que se pueden asignar masivamente
     */
    protected $fillable = [
        'ip_address',
        'razon',
        'bloqueado_por',
        'bloqueado_hasta',
        'intentos_fallidos',
        'notas',
        'activo',
    ];

    /**
     * Campos que deben ser convertidos a tipos nativos
     */
    protected $casts = [
        'bloqueado_hasta' => 'datetime',
        'intentos_fallidos' => 'integer',
        'activo' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con el usuario que bloqueó la IP
     */
    public function bloqueadoPor()
    {
        return $this->belongsTo(User::class, 'bloqueado_por');
    }

    /**
     * Verificar si el bloqueo sigue activo
     */
    public function estaBloqueada(): bool
    {
        if (!$this->activo) {
            return false;
        }

        // Si no tiene fecha de expiración, es permanente
        if (!$this->bloqueado_hasta) {
            return true;
        }

        // Verificar si no ha expirado
        return Carbon::now()->lt($this->bloqueado_hasta);
    }

    /**
     * Verificar si una IP específica está bloqueada
     */
    public static function ipEstaBloqueada(string $ip): bool
    {
        return self::where('ip_address', $ip)
            ->where('activo', true)
            ->where(function ($query) {
                $query->whereNull('bloqueado_hasta')
                    ->orWhere('bloqueado_hasta', '>', Carbon::now());
            })
            ->exists();
    }

    /**
     * Bloquear una IP
     */
    public static function bloquearIp(
        string $ip,
        string $razon,
        ?int $bloqueadoPor = null,
        ?Carbon $bloqueadoHasta = null
    ) {
        return self::updateOrCreate(
            ['ip_address' => $ip],
            [
                'razon' => $razon,
                'bloqueado_por' => $bloqueadoPor ?? auth()->id(),
                'bloqueado_hasta' => $bloqueadoHasta,
                'activo' => true,
            ]
        );
    }

    /**
     * Desbloquear una IP
     */
    public function desbloquear()
    {
        return $this->update(['activo' => false]);
    }

    /**
     * Incrementar contador de intentos fallidos
     */
    public function incrementarIntentos()
    {
        $this->increment('intentos_fallidos');

        // Bloquear automáticamente después de 5 intentos
        if ($this->intentos_fallidos >= 5 && !$this->activo) {
            $this->update([
                'activo' => true,
                'razon' => 'Bloqueado automáticamente por múltiples intentos fallidos',
                'bloqueado_hasta' => Carbon::now()->addHours(24),
            ]);
        }
    }
}
