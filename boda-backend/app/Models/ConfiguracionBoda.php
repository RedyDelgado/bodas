<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConfiguracionBoda extends Model
{
    protected $table = 'configuracion_boda';

    protected $fillable = [
        'boda_id',
        'frase_principal',
        'texto_fecha_religioso',
        'texto_fecha_civil',

        'texto_padres_novio',
        'texto_padres_novia',
        'texto_padrinos_mayores',
        'texto_padrinos_civiles',

        'cronograma_texto',
        'local_religioso',
        'local_recepcion',

        // SOLO URLS
        'ceremonia_maps_url',
        'recepcion_maps_url',

        'texto_cuentas_bancarias',
        'texto_yape',

        'texto_historia_pareja',
        'texto_mensaje_final',

        'texto_preguntas_frecuentes',
    ];

    public function boda(): BelongsTo
    {
        return $this->belongsTo(Boda::class, 'boda_id');
    }
}
