<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;

    protected $fillable = [
        'name',          // lo usaremos como nombre completo
        'email',
        'password',
        'rol_id',
        'telefono',
        'activo',
        'ultimo_acceso_at',
        'suspendido',
        'razon_suspension',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'activo' => 'boolean',
        'suspendido' => 'boolean',
        'ultimo_acceso_at' => 'datetime',
        'last_login_at' => 'datetime',
    ];

    public function rol(): BelongsTo
    {
        return $this->belongsTo(Role::class, 'rol_id');
    }

    public function bodas(): HasMany
    {
        return $this->hasMany(Boda::class, 'user_id');
    }

    /**
     * Alias para compatibilidad con el controlador
     */
    public function role()
    {
        return $this->rol();
    }

    /**
     * Verificar si el usuario es superadmin
     */
    public function isSuperadmin(): bool
    {
        return $this->rol && $this->rol->nombre === 'superadmin';
    }
}
