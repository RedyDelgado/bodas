<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TarjetaDiseno extends Model
{
    protected $table = 'tarjeta_disenos';

    protected $fillable = [
        'boda_id',
        'plantilla_ruta',
        'diseno_json',
        'creado_por',
        'estado_generacion',
        'ultimo_conteo_generado',
        'ultima_generacion_at',
        'ruta_vista_previa',
    ];

    protected $casts = [
        'diseno_json' => 'array',
        'ultima_generacion_at' => 'datetime',
    ];

    public function boda()
    {
        return $this->belongsTo(Boda::class, 'boda_id');
    }
}
