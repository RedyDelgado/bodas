<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Boda extends Model
{
    protected $table = 'bodas';

    protected $fillable = [
        'user_id',
        'plan_id',
        'plantilla_id',
        'nombre_pareja',
        'nombre_novio_1',
        'nombre_novio_2',
        'correo_contacto',
        'fecha_boda',
        'ciudad',
        'subdominio',
        'dominio_personalizado',
        'usa_subdominio',
        'usa_dominio_personalizado',
        'dominio_verificado_at',
        'url_publica_cache',
        'estado',
        'total_invitados',
        'total_confirmados',
        'total_vistas',
        'fecha_publicacion',
    ];


    protected $casts = [
        'fecha_boda'              => 'date',
        'usa_subdominio'          => 'boolean',
        'usa_dominio_personalizado' => 'boolean',
        'dominio_verificado_at'   => 'datetime',
        'fecha_publicacion'       => 'datetime',
    ];

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(Plan::class, 'plan_id');
    }

    public function plantilla(): BelongsTo
    {
        return $this->belongsTo(Plantilla::class, 'plantilla_id');
    }

    public function configuracion(): HasOne
    {
        return $this->hasOne(ConfiguracionBoda::class, 'boda_id');
    }

    public function invitados(): HasMany
    {
        return $this->hasMany(Invitado::class, 'boda_id');
    }

    public function fotos(): HasMany
    {
        return $this->hasMany(FotoBoda::class, 'boda_id');
    }
}
