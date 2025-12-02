<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PlanController;
use App\Http\Controllers\Api\PlantillaController;
use App\Http\Controllers\Api\BodaController;
use App\Http\Controllers\Api\ConfiguracionBodaController;
use App\Http\Controllers\Api\FotoBodaController;
use App\Http\Controllers\Api\InvitadoController;
use App\Http\Controllers\Api\LogWhatsappEnvioController;
use App\Http\Controllers\Api\AjusteMarcaController;
use App\Http\Controllers\Api\FaqPlataformaController;
use App\Http\Controllers\Api\PublicBodaController;
use App\Http\Controllers\Api\PublicRsvpController;
use App\Http\Controllers\Api\FaqBodaController;
/*
|--------------------------------------------------------------------------
| Rutas públicas
|--------------------------------------------------------------------------
*/

// login
Route::post('/auth/login', [AuthController::class, 'login']);

// Ejemplo: listado público de plantillas y planes para la landing
Route::get('/public/planes', [PlanController::class, 'indexPublico']);
Route::get('/public/plantillas', [PlantillaController::class, 'indexPublico']);

// FAQ y ajustes marca públicos (para landing)
Route::get('/public/faqs', [FaqPlataformaController::class, 'indexPublico']);
Route::get('/public/ajustes-marca', [AjusteMarcaController::class, 'showPublico']);

Route::prefix('public')->group(function () {
    // /api/public/boda → detección por host
    Route::get('boda', [PublicBodaController::class, 'showByHost']);

    // /api/public/boda/slug/{slug} → DEMO / vista previa
    Route::get('boda/slug/{slug}', [PublicBodaController::class, 'showBySlug']);

    Route::post('rsvp', [PublicRsvpController::class, 'registrar']);

});
Route::get('/public/rsvp/validar/{codigo}', [PublicRsvpController::class, 'validar']);

/*
|--------------------------------------------------------------------------
| Rutas protegidas por autenticación
|--------------------------------------------------------------------------
*/
Route::middleware('auth:sanctum')->group(function () {

    // Datos del usuario autenticado + logout
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    /*
    |--------------------------------------------------------------------------
    | Rutas para SUPERADMIN
    |--------------------------------------------------------------------------
    |
    | Administración global de la plataforma:
    | - Roles
    | - Planes
    | - Plantillas
    | - Todas las bodas
    | - Ajustes de marca
    | - FAQs
    | - Logs de WhatsApp (solo lectura)
    |
    */
    
    
   


    Route::middleware('role:superadmin')->group(function () {

        // CRUD completo de roles, planes, plantillas
        Route::apiResource('roles', RoleController::class)->except(['show']);
        Route::apiResource('planes', PlanController::class);
        Route::apiResource('plantillas', PlantillaController::class);

        // CRUD completo de bodas (todas las bodas)
        Route::apiResource('bodas', BodaController::class);

        // Configuración de cada boda (1 a 1) - superadmin puede ver/editar cualquier boda
        Route::apiResource('bodas.configuracion', ConfiguracionBodaController::class)
            ->shallow()
            ->only(['show', 'store', 'update']);

        // Fotos de cualquier boda
        Route::apiResource('bodas.fotos', FotoBodaController::class)
            ->shallow()
            ->only(['index', 'store', 'update', 'destroy', 'show']);

        // Invitados de cualquier boda (gestión global)
        Route::apiResource('bodas.invitados', InvitadoController::class)
            ->shallow();

        // Ajustes de marca (normalmente 1 registro, pero dejamos CRUD)
        Route::apiResource('ajustes-marca', AjusteMarcaController::class)->only([
            'index', 'store', 'show', 'update', 'destroy'
        ]);

        // FAQs de la plataforma (CRUD completo)
        Route::apiResource('faqs-plataforma', FaqPlataformaController::class);

        // Logs de envíos de WhatsApp (solo lectura y eliminación)
        Route::apiResource('logs-whatsapp', LogWhatsappEnvioController::class)->only([
            'index', 'show', 'destroy'
        ]);
    });


    /*
    |--------------------------------------------------------------------------
    | Rutas para ADMIN_BODA
    |--------------------------------------------------------------------------
    |
    | Administra SOLO sus bodas y datos asociados.
    |
    | Nota: los controladores deben filtrar por el user_id cuando sea admin_boda.
    |
    */

    Route::middleware('role:admin_boda,superadmin')->group(function () {

        // Bodas del usuario autenticado
        Route::get('/mis-bodas', [BodaController::class, 'indexPropias']);
        Route::get('/mis-bodas/{boda}', [BodaController::class, 'showPropia']);

        // Actualizar datos de la boda propia (pero NO cambiar plan desde aquí)
        Route::put('/mis-bodas/{boda}', [BodaController::class, 'updatePropia']);

        // Configuración de la boda propia
        Route::get('/mis-bodas/{boda}/configuracion', [ConfiguracionBodaController::class, 'showPropia']);
        Route::post('/mis-bodas/{boda}/configuracion', [ConfiguracionBodaController::class, 'storePropia']);
        Route::put('/mis-bodas/{boda}/configuracion', [ConfiguracionBodaController::class, 'updatePropia']);

        // Fotos de la boda propia
        Route::get('/mis-bodas/{boda}/fotos', [FotoBodaController::class, 'indexPropias']);
        Route::post('/mis-bodas/{boda}/fotos', [FotoBodaController::class, 'storePropia']);
        Route::put('/fotos-boda/{foto}', [FotoBodaController::class, 'updatePropia']);
        Route::delete('/fotos-boda/{foto}', [FotoBodaController::class, 'destroyPropia']);
   

        // Fotos del dueño de la boda (panel admin_boda)
        Route::put('/mis-bodas/{boda}/fotos/orden', [FotoBodaController::class, 'reordenarPropias']);


        // FAQs por boda
        Route::get('/mis-bodas/{boda}/faqs', [FaqBodaController::class, 'index']);
        Route::put('/mis-bodas/{boda}/faqs', [FaqBodaController::class, 'sync']);

        // Opcional, por ID
        Route::delete('/boda-faqs/{faq}', [FaqBodaController::class, 'destroy']);


        // Invitados de la boda propia
        Route::get('/mis-bodas/{boda}/invitados', [InvitadoController::class, 'indexPropios']);
        Route::post('/mis-bodas/{boda}/invitados', [InvitadoController::class, 'storePropio']);
        Route::get('/invitados/{invitado}', [InvitadoController::class, 'showPropio']);
        Route::put('/invitados/{invitado}', [InvitadoController::class, 'updatePropio']);
        Route::delete('/invitados/{invitado}', [InvitadoController::class, 'destroyPropio']);

        // Confirmación manual de invitado (si llaman por teléfono, etc.)
        Route::post('/invitados/{invitado}/confirmar', [InvitadoController::class, 'confirmar']);

        // Envío de mensajes WhatsApp (crear log)
        Route::post('/invitados/{invitado}/enviar-whatsapp', [LogWhatsappEnvioController::class, 'enviarMensajeInvitado']);

        // Estadísticas rápidas para el panel de admin de boda
        Route::get('/mis-bodas/{boda}/resumen', [BodaController::class, 'resumenPropia']);
    });
});
