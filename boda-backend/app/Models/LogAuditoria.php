<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LogAuditoria extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla
     */
    protected $table = 'logs_auditoria';

    /**
     * Campos que se pueden asignar masivamente
     */
    protected $fillable = [
        'usuario_id',
        'accion',
        'nivel',
        'descripcion',
        'ip_address',
        'user_agent',
        'datos_adicionales',
        'entidad_tipo',
        'entidad_id',
    ];

    /**
     * Campos que deben ser convertidos a tipos nativos
     */
    protected $casts = [
        'datos_adicionales' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Relación con el usuario que realizó la acción
     */
    public function usuario()
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    /**
     * Método para registrar un log de auditoría
     */
    public static function registrar(
        ?int $usuario_id = null,
        string $accion = '',
        ?string $descripcion = null,
        string $nivel = 'INFO',
        ?string $ip_address = null,
        ?string $user_agent = null,
        ?array $datos_adicionales = null,
        ?string $entidad_tipo = null,
        ?int $entidad_id = null
    ) {
        $request = request();
        
        return self::create([
            'usuario_id' => $usuario_id ?? auth()->id(),
            'accion' => $accion,
            'nivel' => $nivel,
            'descripcion' => $descripcion,
            'ip_address' => $ip_address ?? $request?->ip(),
            'user_agent' => $user_agent ?? $request?->userAgent(),
            'datos_adicionales' => $datos_adicionales,
            'entidad_tipo' => $entidad_tipo,
            'entidad_id' => $entidad_id,
        ]);
    }
}
