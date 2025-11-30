<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FaqPlataforma extends Model
{
    protected $table = 'faqs_plataforma';

    protected $fillable = [
        'orden',
        'pregunta',
        'respuesta',
        'es_activa',
    ];

    protected $casts = [
        'orden'     => 'integer',
        'es_activa' => 'boolean',
    ];
}
