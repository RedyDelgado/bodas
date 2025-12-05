<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FotoBoda extends Model
{
    protected $table = 'fotos_boda';

    protected $fillable = [
        'boda_id',
        'url_imagen',
        'titulo',
        'descripcion',
        'orden',
        'es_portada',
        'es_galeria_privada',
    ];

    protected $casts = [
        'orden'              => 'integer',
        'es_portada'         => 'boolean',
        'es_galeria_privada' => 'boolean',
    ];

    public function boda(): BelongsTo
    {
        return $this->belongsTo(Boda::class, 'boda_id');
    }
     public function scopePortada($q)
    {
        return $q->where('es_portada', true)
                 ->orderBy('orden');
    }
}
