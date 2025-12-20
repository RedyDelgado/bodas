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
use App\Http\Controllers\Api\PublicRsvpCardController;
use App\Http\Controllers\Api\CardDesignController;
use App\Http\Controllers\Api\RsvpGenerationProgressController;
use App\Http\Controllers\Api\RsvpCardDownloadController;
/*
|--------------------------------------------------------------------------
| Rutas públicas
|--------------------------------------------------------------------------
*/

// login
Route::post('/auth/login', [AuthController::class, 'login']);
// registro
Route::post('/auth/register', [AuthController::class, 'register']);

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

    // FAQs públicas de una boda por ID/slug (ej. usada por frontend público)
    // GET /api/public/bodas/{boda}/faqs
    Route::get('bodas/{boda}/faqs', [PublicBodaController::class, 'faqs']);


    Route::get('rsvp-card/{codigo}.png', [PublicRsvpCardController::class, 'show']);



});
// Lista pública de fuentes disponibles en public/fonts
Route::get('/fonts', function() {
    $dir = public_path('fonts');
    $files = [];
    if (is_dir($dir)) {
        foreach (scandir($dir) as $f) {
            if ($f === '.' || $f === '..') continue;
            $path = $dir . DIRECTORY_SEPARATOR . $f;
            if (is_file($path)) {
                $files[] = [
                    'name' => pathinfo($f, PATHINFO_FILENAME),
                    'filename' => $f,
                    // return an API-served absolute URL to avoid dev-server or proxy issues
                    'url' => request()->getSchemeAndHttpHost() . '/api/fonts/file/' . $f,
                ];
            }
        }
    }
    return response()->json($files);
});

// Serve font file through Laravel with CORS headers to avoid OTS errors when frontend
// requests fonts from a different origin/port (Vite dev server vs backend).
Route::get('/fonts/file/{file}', function ($file) {
    $path = public_path('fonts/' . $file);
    if (!file_exists($path)) return response('Not Found', 404);
    $mime = mime_content_type($path) ?: 'application/octet-stream';
    return response()->file($path, [
        'Content-Type' => $mime,
        'Access-Control-Allow-Origin' => '*',
    ]);
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
        Route::post('/mis-bodas/{boda}/invitados/importar', [InvitadoController::class, 'importarPropio']);

        
        Route::get('/invitados/{invitado}', [InvitadoController::class, 'showPropio']);
        Route::put('/invitados/{invitado}', [InvitadoController::class, 'updatePropio']);
        Route::delete('/invitados/{invitado}', [InvitadoController::class, 'destroyPropio']);

        

        // Confirmación manual de invitado (si llaman por teléfono, etc.)
        Route::post('/invitados/{invitado}/confirmar', [InvitadoController::class, 'confirmar']);

        // Envío de mensajes WhatsApp (crear log)
        Route::post('/invitados/{invitado}/enviar-whatsapp', [LogWhatsappEnvioController::class, 'enviarMensajeInvitado']);
        

        // Estadísticas rápidas para el panel de admin de boda
        Route::get('/mis-bodas/{boda}/resumen', [BodaController::class, 'resumenPropia']);

        // Diseño de tarjeta (guardar plantilla + JSON)
        Route::post('/mis-bodas/{boda}/card-design', [CardDesignController::class, 'store']);
        // Generar todas las tarjetas para la boda (background job)
        Route::post('/mis-bodas/{boda}/card-design/generate', [CardDesignController::class, 'generate']);
        // Estado del diseño
        Route::get('/mis-bodas/{boda}/card-design/status', [CardDesignController::class, 'status']);
        Route::get('/mis-bodas/{boda}/card-design/progress', [CardDesignController::class, 'progress']);
        Route::get('/boda/{bodaId}/rsvp-progress', [RsvpGenerationProgressController::class, 'show']);

        // Descargas de tarjetas
        Route::get('/invitados/{invitado}/rsvp-card/download', [RsvpCardDownloadController::class, 'downloadInvitado']);
        Route::get('/mis-bodas/{boda}/tarjetas/descargar-zip', [RsvpCardDownloadController::class, 'downloadAllZip']);

        // Gestión de dominios propios
        Route::post('/mis-bodas/{boda}/dominio', [BodaController::class, 'setDomainPropia']);
        Route::delete('/mis-bodas/{boda}/dominio', [BodaController::class, 'removeDomainPropia']);
        Route::post('/mis-bodas/{boda}/dominio/verificar', [BodaController::class, 'verifyDomainPropia']);
        Route::get('/validar-disponibilidad-dominio', [BodaController::class, 'checkDomainAvailability']);

    });
});
