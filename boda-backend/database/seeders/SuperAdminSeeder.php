<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buscar rol de superadmin
        $rolSuperAdmin = Role::where('nombre', 'superadmin')->first();
        
        if (!$rolSuperAdmin) {
            $this->command->error('❌ Rol superadmin no encontrado. Ejecuta RolesSeeder primero.');
            return;
        }

        // Verificar si el superadmin ya existe
        $existingSuperAdmin = User::where('email', 'redy.delgado@gmail.com')->first();
        
        if ($existingSuperAdmin) {
            // Actualizar password por si acaso
            $existingSuperAdmin->update([
                'password' => Hash::make('R3DY-ARDOS'),
                'rol_id' => $rolSuperAdmin->id,
                'activo' => true,
            ]);
            
            $this->command->info('✅ Superadministrador actualizado: redy.delgado@gmail.com');
            return;
        }

        // Crear superadministrador
        $superAdmin = User::create([
            'name' => 'Redy Delgado',
            'email' => 'redy.delgado@gmail.com',
            'password' => Hash::make('R3DY-ARDOS'),
            'rol_id' => $rolSuperAdmin->id,
            'activo' => true,
        ]);

        $this->command->info('✅ Superadministrador creado exitosamente');
        $this->command->info('   Email: redy.delgado@gmail.com');
        $this->command->info('   Password: R3DY-ARDOS');
    }
}
