<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CardDesign extends Model
{
    protected $table = 'card_designs';

    protected $fillable = [
        'boda_id',
        'template_path',
        'design_json',
        'created_by',
        'generation_status',
        'last_generated_count',
        'last_generated_at',
        'preview_path',
    ];

    protected $casts = [
        'design_json' => 'array',
        'last_generated_at' => 'datetime',
    ];

    protected $appends = [];

    public function boda()
    {
        return $this->belongsTo(Boda::class, 'boda_id');
    }
}
