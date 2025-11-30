<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plantilla extends Model
{
    protected $table = 'plantillas';

    protected $fillable = [
        'nombre',
        'slug',
        'descripcion_corta',
        'es_activa',
        'conteo_usos',
        'preview_imagen_url',
    ];

    protected $casts = [
        'es_activa'   => 'boolean',
        'conteo_usos' => 'integer',
    ];

    public function bodas(): HasMany
    {
        return $this->hasMany(Boda::class, 'plantilla_id');
    }
}
