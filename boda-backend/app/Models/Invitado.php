<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class Invitado extends Model
{
    protected $table = 'invitados';

    protected $fillable = [
        'boda_id',
        'codigo_clave',
        'nombre_invitado',
        'pases',
        'correo',
        'celular',
        'nombre_acompanante',
        'es_confirmado',
        'fecha_confirmacion',
        'notas',

        //  NUEVO: RSVP card cache
        'rsvp_card_path',
        'rsvp_card_hash',
        'rsvp_card_generated_at',
    ];

    protected $casts = [
        'pases'              => 'integer',
        'es_confirmado'      => 'boolean',
        'fecha_confirmacion' => 'datetime',

        // NUEVO
        'rsvp_card_generated_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function (Invitado $invitado) {
            // Si no se envía código manualmente, lo generamos
            if (empty($invitado->codigo_clave)) {
                $invitado->codigo_clave = strtoupper(Str::random(8));
            }
        });

        // Después de crear un invitado, si la boda tiene un diseño guardado, encolamos generación de su tarjeta
        static::created(function (Invitado $invitado) {
            try {
                $boda = $invitado->boda;
                if (!$boda) return;
                $hasDesign = \App\Models\TarjetaDiseno::where('boda_id', $boda->id)->exists();
                if ($hasDesign) {
                    \App\Jobs\GenerateRsvpCardJob::dispatch($invitado->id);
                }
            } catch (\Throwable $e) {
                \Log::warning('auto-generate rsvp card failed for invitado ' . $invitado->id . ': ' . $e->getMessage());
            }
        });

        //  Opcional recomendado:
        // Si cambian campos “que afectan el texto”, invalidamos cache para regenerar

        static::updated(function (Invitado $invitado) {

            // Ajusta esta lista a lo que realmente aparece en la tarjeta
            if (! $invitado->wasChanged(['nombre_invitado', 'pases', 'celular'])) {
                return;
            }

            // 1) invalidar cache (guardar NULL) sin disparar eventos otra vez
            $invitado->forceFill([
                'rsvp_card_path' => null,
                'rsvp_card_hash' => null,
                'rsvp_card_generated_at' => null,
            ])->saveQuietly();

            // 2) regenerar SOLO esta tarjeta (después de commit)
            \App\Jobs\GenerateRsvpCardJob::dispatch($invitado->id)->afterCommit();
        });
    }

    public function boda(): BelongsTo
    {
        return $this->belongsTo(Boda::class, 'boda_id');
    }

    public function logsWhatsapp(): HasMany
    {
        return $this->hasMany(LogWhatsappEnvio::class, 'invitado_id');
    }

    /**
     * ✅ Accessor: URL pública de la tarjeta generada (si existe)
     * Requiere: php artisan storage:link
     */
    public function getRsvpCardUrlAttribute(): ?string
    {
        if (!$this->rsvp_card_path) return null;
        if (!Storage::disk('public')->exists($this->rsvp_card_path)) return null;

        return Storage::disk('public')->url($this->rsvp_card_path);
    }

    /**
     * ✅ Limpia cache para forzar regeneración la próxima vez
     */
    public function invalidateRsvpCardCache(): void
    {
        $this->rsvp_card_path = null;
        $this->rsvp_card_hash = null;
        $this->rsvp_card_generated_at = null;
    }
}
