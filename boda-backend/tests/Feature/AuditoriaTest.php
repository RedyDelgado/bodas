<?php

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\User;
use App\Models\Boda;
use App\Models\LogAuditoria;

class AuditoriaTest extends TestCase
{
    /** @test */
    public function test_observer_usuario_registra_cambios()
    {
        // Crear usuario de prueba
        $user = User::factory()->create(['name' => 'Usuario Test']);
        
        // Actualizar usuario (debe disparar observer)
        $user->update(['name' => 'Usuario Modificado']);
        
        // Verificar que se creó el log
        $log = LogAuditoria::where('accion', 'usuario.actualizado')
            ->where('entidad_id', $user->id)
            ->latest()
            ->first();
        
        $this->assertNotNull($log);
        $this->assertEquals('usuario.actualizado', $log->accion);
        $this->assertStringContainsString('Usuario Modificado', $log->descripcion);
    }
    
    /** @test */
    public function test_observer_boda_registra_creacion()
    {
        $user = User::factory()->create();
        
        // Crear boda (debe disparar observer)
        $boda = Boda::create([
            'usuario_id' => $user->id,
            'nombre_novia' => 'María',
            'nombre_novio' => 'Juan',
            'slug' => 'maria-juan-test',
            'fecha_evento' => now()->addMonth(),
        ]);
        
        // Verificar que se creó el log
        $log = LogAuditoria::where('accion', 'boda.creada')
            ->where('entidad_id', $boda->id)
            ->latest()
            ->first();
        
        $this->assertNotNull($log);
        $this->assertEquals('boda.creada', $log->accion);
        $this->assertStringContainsString('María & Juan', $log->descripcion);
    }
    
    /** @test */
    public function test_filtro_por_usuario_funciona()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();
        
        // Crear logs para diferentes usuarios
        LogAuditoria::registrar(
            usuario_id: $user1->id,
            accion: 'test.accion1',
            descripcion: 'Test 1'
        );
        
        LogAuditoria::registrar(
            usuario_id: $user2->id,
            accion: 'test.accion2',
            descripcion: 'Test 2'
        );
        
        // Verificar filtro
        $logsUser1 = LogAuditoria::where('usuario_id', $user1->id)->count();
        $logsUser2 = LogAuditoria::where('usuario_id', $user2->id)->count();
        
        $this->assertGreaterThanOrEqual(1, $logsUser1);
        $this->assertGreaterThanOrEqual(1, $logsUser2);
    }
}
