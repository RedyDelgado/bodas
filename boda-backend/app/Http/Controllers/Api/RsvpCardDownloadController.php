<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invitado;
use App\Models\Boda;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use ZipArchive;
use Illuminate\Support\Str;

class RsvpCardDownloadController extends Controller
{
    protected function ensureOwnerOrAbort(Boda $boda): void
    {
        $user = Auth::user();
        if (!$user || ($user->rol?->nombre !== 'superadmin' && $boda->user_id !== $user->id)) {
            abort(403, 'Sin permiso para esta boda');
        }
    }

    /**
     * Descarga la tarjeta de un invitado específico
     * GET /invitados/{invitado}/rsvp-card/download
     */
    public function downloadInvitado(Invitado $invitado)
    {
        $boda = $invitado->boda;
        $this->ensureOwnerOrAbort($boda);

        if (!$invitado->rsvp_card_path || !Storage::disk('public')->exists($invitado->rsvp_card_path)) {
            return response()->json(['error' => 'Tarjeta no encontrada'], 404);
        }

        $bytes = Storage::disk('public')->get($invitado->rsvp_card_path);
        $ext = pathinfo($invitado->rsvp_card_path, PATHINFO_EXTENSION) ?: 'png';
        $contentType = $ext === 'webp' ? 'image/webp' : 'image/png';

        $nombreArchivo = preg_replace('/[^a-zA-Z0-9\s]/', '', $invitado->nombre_invitado ?? 'Invitado');
        $nombreArchivo = preg_replace('/\s+/', '_', trim($nombreArchivo));
        $fechaCreacion = $invitado->created_at ? $invitado->created_at->format('Y-m-d') : date('Y-m-d');
        $nombreDescarga = "{$nombreArchivo}_{$fechaCreacion}.{$ext}";

        return response($bytes, 200)
            ->header('Content-Type', $contentType)
            ->header('Content-Disposition', 'attachment; filename="' . $nombreDescarga . '"')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    /**
     * Descarga todas las tarjetas en un ZIP
     * GET /mis-bodas/{bodaId}/tarjetas/descargar-zip
     */
    public function downloadAllZip(Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $invitados = $boda->invitados()
            ->whereNotNull('rsvp_card_path')
            ->get();

        if ($invitados->isEmpty()) {
            return response()->json(['error' => 'No hay tarjetas para descargar'], 404);
        }

        // Crear archivo temporal ZIP
        $zipPath = storage_path('app/temp/' . Str::uuid() . '.zip');
        @mkdir(dirname($zipPath), 0755, true);

        $zip = new ZipArchive();
        if ($zip->open($zipPath, ZipArchive::CREATE) !== true) {
            return response()->json(['error' => 'No se pudo crear el ZIP'], 500);
        }

        foreach ($invitados as $inv) {
            if (!Storage::disk('public')->exists($inv->rsvp_card_path)) {
                continue;
            }

            $bytes = Storage::disk('public')->get($inv->rsvp_card_path);
            $ext = pathinfo($inv->rsvp_card_path, PATHINFO_EXTENSION) ?: 'png';

            $nombreArchivo = preg_replace('/[^a-zA-Z0-9\s]/', '', $inv->nombre_invitado ?? 'Invitado');
            $nombreArchivo = preg_replace('/\s+/', '_', trim($nombreArchivo));
            $nombreZip = "{$nombreArchivo}.{$ext}";

            $zip->addFromString($nombreZip, $bytes);
        }

        $zip->close();

        // Leer el archivo ZIP
        $zipContent = file_get_contents($zipPath);
        @unlink($zipPath); // Eliminar después de leer

        // Enviar ZIP con headers CORS explícitos
        $nombreZip = $boda->nombre_pareja
            ? preg_replace('/[^a-zA-Z0-9]/', '_', $boda->nombre_pareja) . '_tarjetas.zip'
            : 'tarjetas.zip';

        return response($zipContent, 200)
            ->header('Content-Type', 'application/zip')
            ->header('Content-Disposition', 'attachment; filename="' . $nombreZip . '"')
            ->header('Access-Control-Allow-Origin', 'http://localhost:5173')
            ->header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
            ->header('Cache-Control', 'no-cache, must-revalidate');
    }
}
