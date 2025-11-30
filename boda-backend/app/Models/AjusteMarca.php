<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AjusteMarca extends Model
{
    protected $table = 'ajustes_marca';

    protected $fillable = [
        'nombre_plataforma',
        'logo_url',
        'color_principal',
        'color_secundario',
        'color_acento',
        'texto_politica_privacidad',
        'texto_terminos_condiciones',
        'activo',
    ];

    protected $casts = [
        'activo' => 'boolean',
    ];
}
