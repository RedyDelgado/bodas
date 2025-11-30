<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    protected $table = 'planes';

    protected $fillable = [
        'nombre',
        'slug',
        'descripcion_corta',
        'precio_monetario',
        'moneda',
        'incluye_subdominio',
        'permite_dominio_propio',
        'invitados_ilimitados',
        'activo',
    ];

    protected $casts = [
        'precio_monetario'        => 'float',
        'incluye_subdominio'      => 'boolean',
        'permite_dominio_propio'  => 'boolean',
        'invitados_ilimitados'    => 'boolean',
        'activo'                  => 'boolean',
    ];

    public function bodas(): HasMany
    {
        return $this->hasMany(Boda::class, 'plan_id');
    }
}
