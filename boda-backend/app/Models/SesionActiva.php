<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class SesionActiva extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla
     */
    protected $table = 'sesiones_activas';

    /**
     * Campos que se pueden asignar masivamente
     */
    protected $fillable = [
        'usuario_id',
        'token',
        'ip_address',
        'user_agent',
        'ultima_actividad',
        'expires_at',
    ];

    /**
     * Campos que deben ser convertidos a tipos nativos
     */
    protected $casts = [
        'ultima_actividad' => 'datetime',
        'expires_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con el usuario
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Verificar si la sesión está activa
     */
    public function estaActiva(): bool
    {
        if ($this->expires_at) {
            return Carbon::now()->lt($this->expires_at);
        }
        
        // Si no hay fecha de expiración, verificar última actividad (15 minutos)
        return Carbon::now()->diffInMinutes($this->ultima_actividad) <= 15;
    }

    /**
     * Actualizar última actividad
     */
    public function actualizarActividad()
    {
        $this->update(['ultima_actividad' => Carbon::now()]);
    }

    /**
     * Limpiar sesiones expiradas
     */
    public static function limpiarExpiradas()
    {
        return self::where('expires_at', '<', Carbon::now())
            ->orWhere('ultima_actividad', '<', Carbon::now()->subMinutes(30))
            ->delete();
    }
}
