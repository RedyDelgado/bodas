<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Invitado;
use Illuminate\Http\Request;
use Intervention\Image\Laravel\Facades\Image;

class PublicRsvpCardController extends Controller
{
    public function show(string $codigo)
    {
        $inv = Invitado::where('codigo_clave', strtoupper($codigo))->firstOrFail();

        // Imagen base (tu plantilla)
        // Puede estar en /public/img/tarjeta_base.jpg o storage public.
        $basePath = public_path('img/tarjeta_base.jpg');

        // Fuente TTF (guárdala en /public/fonts/)
        $fontPath = public_path('fonts/CormorantGaramond-SemiBold.ttf');

        $img = Image::read($basePath);

        $nombre = trim($inv->nombre_invitado ?? 'Invitado');

        // Ajuste simple para nombres largos (rápido y efectivo)
        $len = mb_strlen($nombre);
        $size = $len > 34 ? 46 : ($len > 26 ? 54 : 64);

        // Posición (centro). Ajusta Y según tu diseño.
        $x = (int)($img->width() / 2);
        $y = (int)($img->height() * 0.58);

        // “Sombra” (escribes 2 veces)
        $img->text($nombre, $x + 2, $y + 2, function ($font) use ($fontPath, $size) {
            $font->file($fontPath);
            $font->size($size);
            $font->color('rgba(0,0,0,0.55)');
            $font->align('center');
            $font->valign('middle');
        });

        // Texto principal
        $img->text($nombre, $x, $y, function ($font) use ($fontPath, $size) {
            $font->file($fontPath);
            $font->size($size);
            $font->color('#FFFFFF');
            $font->align('center');
            $font->valign('middle');
        });

        // (Opcional) Línea extra pequeña debajo
        $img->text('Estás cordialmente invitado(a)', $x, (int)($y + 68), function ($font) use ($fontPath) {
            $font->file($fontPath);
            $font->size(28);
            $font->color('rgba(255,255,255,0.92)');
            $font->align('center');
            $font->valign('middle');
        });

        $bytes = (string) $img->toPng(); // salida final en PNG

        return response($bytes, 200)
            ->header('Content-Type', 'image/png')
            // para facilitar descarga/adjuntar
            ->header('Content-Disposition', 'inline; filename="tarjeta-'.$inv->codigo_clave.'.png"')
            // cache corto (opcional)
            ->header('Cache-Control', 'public, max-age=3600');
    }
}
