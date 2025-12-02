<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FaqBoda extends Model
{
   protected $table = 'faqs_boda';

    protected $fillable = [
        'boda_id',
        'orden',
        'pregunta',
        'respuesta',
        'es_activa',
    ];

    public function boda()
    {
        return $this->belongsTo(Boda::class);
    }
}
