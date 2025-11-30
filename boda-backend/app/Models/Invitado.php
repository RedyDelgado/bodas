<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Invitado extends Model
{
    protected $table = 'invitados';

    protected $fillable = [
        'boda_id',
        'codigo_clave',
        'nombre_invitado',
        'pases',
        'correo',
        'celular',
        'nombre_acompanante',
        'es_confirmado',
        'fecha_confirmacion',
        'notas',
    ];

    protected $casts = [
        'pases'              => 'integer',
        'es_confirmado'      => 'boolean',
        'fecha_confirmacion' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function (Invitado $invitado) {
            // Si no se envía código manualmente, lo generamos
            if (empty($invitado->codigo_clave)) {
                $invitado->codigo_clave = strtoupper(Str::random(8));
            }
        });
    }

    public function boda(): BelongsTo
    {
        return $this->belongsTo(Boda::class, 'boda_id');
    }

    public function logsWhatsapp(): HasMany
    {
        return $this->hasMany(LogWhatsappEnvio::class, 'invitado_id');
    }
}
