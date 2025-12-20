<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\LogAuditoria;
use App\Models\User;

class LogsAuditoriaSeeder extends Seeder
{
    /**
     * Ejecutar el seeder para crear logs de prueba
     */
    public function run(): void
    {
        $superadmin = User::whereHas('rol', function ($q) {
            $q->where('nombre', 'superadmin');
        })->first();

        if (!$superadmin) {
            $this->command->warn('No se encontró superadmin, no se crearán logs');
            return;
        }

        $usuarios = User::all();

        // Crear algunos logs de ejemplo
        $logs = [
            [
                'usuario_id' => $superadmin->id,
                'accion' => 'login',
                'nivel' => 'INFO',
                'descripcion' => 'Inicio de sesión exitoso',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            ],
            [
                'usuario_id' => $superadmin->id,
                'accion' => 'crear_usuario',
                'nivel' => 'MEDIO',
                'descripcion' => 'Nuevo usuario creado: test@example.com',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'entidad_tipo' => 'Usuario',
                'entidad_id' => 2,
            ],
            [
                'usuario_id' => $superadmin->id,
                'accion' => 'editar_boda',
                'nivel' => 'INFO',
                'descripcion' => 'Boda actualizada: María & Juan',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'entidad_tipo' => 'Boda',
                'entidad_id' => 1,
            ],
            [
                'usuario_id' => $superadmin->id,
                'accion' => 'bloquear_ip',
                'nivel' => 'CRITICO',
                'descripcion' => 'IP bloqueada por múltiples intentos fallidos: 192.168.1.50',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'datos_adicionales' => json_encode(['ip_bloqueada' => '192.168.1.50']),
            ],
            [
                'usuario_id' => $usuarios->skip(1)->first()?->id,
                'accion' => 'login',
                'nivel' => 'INFO',
                'descripcion' => 'Inicio de sesión exitoso',
                'ip_address' => '192.168.1.101',
                'user_agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            ],
            [
                'usuario_id' => $superadmin->id,
                'accion' => 'suspender_usuario',
                'nivel' => 'CRITICO',
                'descripcion' => 'Usuario suspendido por violación de términos',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'entidad_tipo' => 'Usuario',
                'entidad_id' => 3,
            ],
            [
                'usuario_id' => $usuarios->skip(2)->first()?->id,
                'accion' => 'enviar_invitacion',
                'nivel' => 'INFO',
                'descripcion' => 'Invitación enviada por WhatsApp',
                'ip_address' => '192.168.1.102',
                'user_agent' => 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)',
            ],
            [
                'usuario_id' => $superadmin->id,
                'accion' => 'exportar_usuarios',
                'nivel' => 'INFO',
                'descripcion' => 'Usuarios exportados a CSV',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            ],
            [
                'usuario_id' => null, // Sistema
                'accion' => 'calcular_metricas',
                'nivel' => 'INFO',
                'descripcion' => 'Métricas diarias calculadas automáticamente',
                'ip_address' => '127.0.0.1',
                'user_agent' => 'Laravel Scheduler',
            ],
            [
                'usuario_id' => $superadmin->id,
                'accion' => 'impersonar_usuario',
                'nivel' => 'MEDIO',
                'descripcion' => 'Superadmin impersonando a usuario@example.com',
                'ip_address' => '192.168.1.100',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'datos_adicionales' => json_encode(['usuario_impersonado' => 4]),
            ],
        ];

        foreach ($logs as $log) {
            LogAuditoria::create($log);
        }

        $this->command->info('Se crearon ' . count($logs) . ' logs de auditoría de ejemplo');
    }
}
