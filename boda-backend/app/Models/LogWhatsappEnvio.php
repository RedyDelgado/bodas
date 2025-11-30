<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LogWhatsappEnvio extends Model
{
    protected $table = 'logs_whatsapp_envios';

    protected $fillable = [
        'invitado_id',
        'telefono_enviado',
        'contenido_mensaje',
        'estado_envio',
        'respuesta_gateway',
        'enviado_en',
    ];

    protected $casts = [
        'enviado_en' => 'datetime',
    ];

    public function invitado(): BelongsTo
    {
        return $this->belongsTo(Invitado::class, 'invitado_id');
    }
}
