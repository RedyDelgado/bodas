<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class MetricaPlataforma extends Model
{
    use HasFactory;

    /**
     * Nombre de la tabla
     */
    protected $table = 'metricas_plataforma';

    /**
     * Campos que se pueden asignar masivamente
     */
    protected $fillable = [
        'fecha',
        'total_usuarios',
        'usuarios_activos',
        'total_bodas',
        'bodas_activas',
        'ingresos_dia',
        'conversiones',
        'invitaciones_enviadas',
        'confirmaciones_recibidas',
        'visitas_publicas',
    ];

    /**
     * Campos que deben ser convertidos a tipos nativos
     */
    protected $casts = [
        'fecha' => 'date',
        'total_usuarios' => 'integer',
        'usuarios_activos' => 'integer',
        'total_bodas' => 'integer',
        'bodas_activas' => 'integer',
        'ingresos_dia' => 'decimal:2',
        'conversiones' => 'integer',
        'invitaciones_enviadas' => 'integer',
        'confirmaciones_recibidas' => 'integer',
        'visitas_publicas' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Método para calcular y guardar las métricas del día
     */
    public static function calcularMetricasHoy()
    {
        $fecha = Carbon::today();
        
        return self::updateOrCreate(
            ['fecha' => $fecha],
            [
                'total_usuarios' => \App\Models\User::count(),
                'usuarios_activos' => \App\Models\User::whereDate('last_login_at', $fecha)->count(),
                'total_bodas' => \App\Models\Boda::count(),
                'bodas_activas' => \App\Models\Boda::where('estado', 'activa')->count(),
                // Los demás campos se pueden actualizar según la lógica específica
            ]
        );
    }
}
