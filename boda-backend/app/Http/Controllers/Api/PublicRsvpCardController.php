<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invitado;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class PublicRsvpCardController extends Controller
{
    public function show(Request $request, string $codigo)
    {
        $codigo = strtoupper(trim(pathinfo($codigo, PATHINFO_FILENAME))); 

        $inv = Invitado::with('boda')
            ->where('codigo_clave', $codigo)
            ->firstOrFail();

            $boda = $inv->boda;

            // Parámetros comunes
            $isDownload = $request->boolean('download');
            $optimize = $request->boolean('opt');
            $previewRequested = $request->boolean('preview'); // si se pide explícitamente el preview

            // Si NO es una descarga y NO se pidió preview explícitamente, devolvemos un JSON
            // con el estado y la URL de descarga para que el frontend muestre un loader
            if (!$isDownload && !$previewRequested) {
                $has = !empty($inv->rsvp_card_path) && Storage::disk('public')->exists($inv->rsvp_card_path);
                $downloadUrl = url('/api/public/rsvp-card/' . $codigo . '.png?download=1');
                return response()->json([
                    'has_card' => $has,
                    'download_url' => $downloadUrl,
                    'message' => $has ? 'Tarjeta disponible para descarga' : 'Tarjeta no generada: pulse descargar para generarla',
                ]);
            }

            // Si el invitado ya tiene una tarjeta guardada en storage, úsala
            if (!empty($inv->rsvp_card_path) && Storage::disk('public')->exists($inv->rsvp_card_path)) {
                $storedPath = Storage::disk('public')->path($inv->rsvp_card_path);

                // Si piden preview, devolvemos una versión reducida en línea
                if (!$isDownload) {
                    $img = Image::make($storedPath);
                    $previewMaxWidth = 360;
                    if ($img->width() > $previewMaxWidth) {
                        $img->resize($previewMaxWidth, null, function ($constraint) {
                            $constraint->aspectRatio();
                            $constraint->upsize();
                        });
                    }

                    $bytes = (string) $img->toPng();
                    return response($bytes, 200)
                        ->header('Content-Type', 'image/png')
                        ->header('Cache-Control', 'public, max-age=3600');
                }

                // Si piden descarga optimizada y existe una versión WebP guardada, la servimos.
                if ($isDownload && $optimize) {
                    // derivar posible path webp (misma base, extensión .webp)
                    $webpPath = preg_replace('/\.[^.]+$/', '.webp', $inv->rsvp_card_path);
                    if (Storage::disk('public')->exists($webpPath)) {
                        $bytes = Storage::disk('public')->get($webpPath);
                        $contentType = 'image/webp';
                        $ext = 'webp';
                    } else {
                        // si no existe, intentar re-encode (y no fallar)
                        try {
                            $img = Image::make($storedPath);
                            $bytes = (string) $img->encode('webp', 85);
                            $contentType = 'image/webp';
                            $ext = 'webp';
                        } catch (\Throwable $e) {
                            // fallback a PNG
                            $bytes = Storage::disk('public')->get($inv->rsvp_card_path);
                            $contentType = 'image/png';
                            $ext = pathinfo($inv->rsvp_card_path, PATHINFO_EXTENSION) ?: 'png';
                        }
                    }

                    $nombreArchivo = $inv->nombre_invitado ?? 'Invitado';
                    $telefono = $inv->celular ?? $inv->telefono ?? 'sin-telefono';
                    $fechaCreacion = $inv->created_at ? $inv->created_at->format('Y-m-d') : date('Y-m-d');
                    $nombreArchivo = preg_replace('/[^a-zA-Z0-9\s]/', '', $nombreArchivo);
                    $nombreArchivo = preg_replace('/\s+/', '_', trim($nombreArchivo));
                    $telefono = preg_replace('/[^0-9]/', '', $telefono);
                    $nombreDescarga = "{$nombreArchivo}_{$telefono}_{$fechaCreacion}.{$ext}";

                    return response($bytes, 200)
                        ->header('Content-Type', $contentType)
                        ->header('Content-Disposition', 'attachment; filename="'.$nombreDescarga.'"')
                        ->header('Cache-Control', 'public, max-age=3600');
                }

                // Si piden descarga normal, devolvemos el archivo guardado directamente
                $fileContents = Storage::disk('public')->get($inv->rsvp_card_path);
                $ext = pathinfo($inv->rsvp_card_path, PATHINFO_EXTENSION) ?: 'png';
                $contentType = $ext === 'webp' ? 'image/webp' : 'image/png';

                $nombreArchivo = $inv->nombre_invitado ?? 'Invitado';
                $telefono = $inv->celular ?? $inv->telefono ?? 'sin-telefono';
                $fechaCreacion = $inv->created_at ? $inv->created_at->format('Y-m-d') : date('Y-m-d');
                $nombreArchivo = preg_replace('/[^a-zA-Z0-9\s]/', '', $nombreArchivo);
                $nombreArchivo = preg_replace('/\s+/', '_', trim($nombreArchivo));
                $telefono = preg_replace('/[^0-9]/', '', $telefono);
                $nombreDescarga = "{$nombreArchivo}_{$telefono}_{$fechaCreacion}.{$ext}";

                return response($fileContents, 200)
                    ->header('Content-Type', $contentType)
                    ->header('Content-Disposition', 'attachment; filename="'.$nombreDescarga.'"')
                    ->header('Cache-Control', 'public, max-age=3600');
            }

        // 1) Paths fijos y controlados (evita depender de fonts del sistema)
        $basePath = storage_path('app/public/tarjetas/tarjeta_base.png');
        if (!file_exists($basePath)) {
            abort(500, "No se encontró tarjeta_base.png en storage/app/public/tarjetas/");
        }

        $fontPath = public_path('fonts/CormorantGaramond-SemiBold.ttf');
        if (!file_exists($fontPath)) {
            abort(500, "No se encontró la fuente en public/fonts/CormorantGaramond-SemiBold.ttf");
        }

        // 2) Parámetros de salida
        $isDownload = $request->boolean('download');
        $force      = $request->boolean('force'); // para regenerar manualmente
        $fmt        = strtolower($request->get('fmt', $isDownload ? 'jpg' : 'webp')); // web default / descarga jpg default

        if (!in_array($fmt, ['png', 'jpg', 'jpeg', 'webp'])) {
            $fmt = $isDownload ? 'jpg' : 'webp';
        }

        // 3) Textos
        $nombreInvitado = trim($inv->nombre_invitado ?? 'Invitado');
        $nombrePareja   = trim($boda?->nombre_pareja ?? 'Nuestra boda');
        $ciudad         = trim($boda?->ciudad ?? '');

        $fechaBonita = '';
        if (!empty($boda?->fecha_boda)) {
            try {
                $fechaBonita = Carbon::parse($boda->fecha_boda)
                    ->locale('es')
                    ->translatedFormat('l d \d\e F \d\e Y');
            } catch (\Throwable $e) {
                $fechaBonita = (string) $boda->fecha_boda;
            }
        }

        // 4) Hash de caché (si cambian datos/plantilla/fuente, se regenera)
        $hashPayload = [
            'boda_id' => $boda?->id,
            'inv_id'  => $inv->id,
            'inv_u'   => optional($inv->updated_at)->timestamp,
            'boda_u'  => optional($boda?->updated_at)->timestamp,
            'tpl_m'   => @filemtime($basePath) ?: 0,
            'font_m'  => @filemtime($fontPath) ?: 0,
            'fmt'     => $fmt,
            'nombreInvitado' => $nombreInvitado,
            'nombrePareja'   => $nombrePareja,
            'ciudad'         => $ciudad,
            'fecha'          => $fechaBonita,
        ];
        $hash = hash('sha256', json_encode($hashPayload));

        // 5) Si ya existe y coincide el hash, SOLO servir archivo
        if (!$force && $inv->rsvp_card_path && $inv->rsvp_card_hash === $hash) {
            if (Storage::disk('public')->exists($inv->rsvp_card_path)) {
                $bytes = Storage::disk('public')->get($inv->rsvp_card_path);

                return response($bytes, 200)
                    ->header('Content-Type', $this->contentTypeFromFmt($fmt))
                    ->header('Content-Disposition', ($isDownload ? 'attachment' : 'inline') . '; filename="'.$this->downloadName($inv, $boda, $fmt).'"')
                    ->header('Cache-Control', 'public, max-age=86400');
            }
        }

        // 6) Generar imagen
        $img = Image::read($basePath);
        $imgW = $img->width();
        $imgH = $img->height();

        $x = (int) round($imgW / 2);

        // Colores (ajusta si deseas)
        $colorPrincipal  = "#1E3A8A";
        $colorSecundario = "rgba(30,58,138,0.92)";

        // Tamaños proporcionales al ancho (mantiene consistencia)
        $scale = $imgW / 1080; // 1080 es el ancho típico de tu plantilla vertical
        $sizeNos     = max(18, (int) round(44 * $scale));
        $sizeInv     = max(18, (int) round(46 * $scale));
        $sizePareja  = max(22, (int) round(58 * $scale));
        $sizeFecha   = max(16, (int) round(28 * $scale));
        $sizeCiudad  = max(16, (int) round(26 * $scale));

        // 7) Layout “premium”: bloque centrado + gaps por fuente (no porcentajes raros)
        $hasFecha  = !empty($fechaBonita);
        $hasCiudad = !empty($ciudad);

        $gap1 = (int) round($sizeNos * 0.70);
        $gap2 = (int) round($sizeInv * 0.75);
        $gap3 = (int) round($sizePareja * 0.80);
        $gap4 = (int) round($sizeFecha * 0.70);

        $blockHeight =
            $sizeNos +
            $gap1 + $sizeInv +
            $gap2 + $sizePareja +
            ($hasFecha ? ($gap3 + $sizeFecha) : 0) +
            ($hasCiudad ? ($gap4 + $sizeCiudad) : 0);

        // Centro visual: un poco arriba del centro (por flores abajo)
        $centerY = (int) round($imgH * 0.47);
        $topY = (int) round($centerY - ($blockHeight / 2));

        $y1 = $topY + (int) round($sizeNos / 2);
        $y2 = $y1 + (int) round($sizeNos / 2) + $gap1 + (int) round($sizeInv / 2);
        $y3 = $y2 + (int) round($sizeInv / 2) + $gap2 + (int) round($sizePareja / 2);

        $y = $y3 + (int) round($sizePareja / 2);

        $writeShadow = function ($text, $x, $y, $size, $color, $opacityText = 0.22) use ($img, $fontPath) {
            // Sombra sutil + texto principal centrado
            $img->text($text, $x + 2, $y + 2, function ($font) use ($fontPath, $size, $opacityText) {
                $font->filename($fontPath);
                $font->size($size);
                $font->color('rgba(0,0,0,' . $opacityText . ')');
                $font->align('center');
                $font->valign('middle');
            });

            $img->text($text, $x, $y, function ($font) use ($fontPath, $size, $color) {
                $font->filename($fontPath);
                $font->size($size);
                $font->color($color);
                $font->align('center');
                $font->valign('middle');
            });
        };

        // Nuevo layout según tu última indicación:
        // - Nombre de la pareja (grande)
        // - "¡Nos casamos!" debajo
        // - Línea/divisor con corazón al medio usa cualquier forma ascii o símbolo
        // - Mensaje explicativo
        // - Fecha
        // - Lugar
        // - Código y dominio surbrayado color azul
        // - En la parte inferior izquiera, grande en circulo del color de la tarjeta con el numero de pases en blanco: número de pases

        // Sizes (aumentados para mejor legibilidad en móvil)
        $sizeCouple = max(48, (int) round(90 * $scale));
        $sizeNos = max(24, (int) round(40 * $scale));
        $sizeDivider = max(20, (int) round(28 * $scale));
        $sizeMensaje = max(18, (int) round(22 * $scale));
        $sizeFecha = max(18, (int) round(22 * $scale));
        $sizeCiudad = max(16, (int) round(20 * $scale));
        $sizeMeta = max(14, (int) round(18 * $scale));
        $sizePases = max(36, (int) round(80 * $scale));

        // Layout central (reordenado según petición)
        $gap = (int) round(22 * $scale);
        $blockHeight = $sizeCouple + $gap + $sizeNos + $gap + $sizeDivider + $gap + $sizeMensaje + ($hasFecha ? ($gap + $sizeFecha) : 0) + ($hasCiudad ? ($gap + $sizeCiudad) : 0) + $gap + $sizeMeta;

        $centerY = (int) round($imgH * 0.45);
        $topY = (int) round($centerY - ($blockHeight / 2));

        $curY = $topY + (int) round($sizeCouple / 2);

        // 1) Nombre de la pareja (grande)
        $writeShadow($nombrePareja, $x, $curY, $sizeCouple, $colorPrincipal, 0.06);

        // 2) "¡Nos casamos!" debajo
        $curY = $curY + (int) round($sizeCouple / 2) + $gap + (int) round($sizeNos / 2);
        $writeShadow("¡Nos casamos!", $x, $curY, $sizeNos, $colorPrincipal, 0.08);

        // 3) Divisor con corazón centrado
        $curY = $curY + (int) round($sizeNos / 2) + $gap + (int) round($sizeDivider / 2);
        $dividerText = "——  ❤  ——";
        $img->text($dividerText, $x, $curY, function ($font) use ($fontPath, $sizeDivider) {
            $font->filename($fontPath);
            $font->size($sizeDivider);
            $font->color('rgba(30,58,138,0.60)');
            $font->align('center');
            $font->valign('middle');
        });

        // 4) Mensaje explicativo
        $curY = $curY + (int) round($sizeDivider / 2) + $gap + (int) round($sizeMensaje / 2);
        $mensajeExp = "Porque las personas importantes para nosotros no pueden faltar: acompáñanos a celebrar nuestro gran día";
        $img->text($mensajeExp, $x, $curY, function ($font) use ($fontPath, $sizeMensaje) {
            $font->filename($fontPath);
            $font->size($sizeMensaje);
            $font->color('rgba(30,58,138,0.70)');
            $font->align('center');
            $font->valign('middle');
        });

        // 5) Fecha
        if ($hasFecha) {
            $curY = $curY + (int) round($sizeMensaje / 2) + $gap + (int) round($sizeFecha / 2);
            $writeShadow($fechaBonita, $x, $curY, $sizeFecha, $colorSecundario, 0.05);
        }

        // 6) Ciudad / lugar
        if ($hasCiudad) {
            $curY = $curY + (int) round($sizeFecha / 2) + $gap + (int) round($sizeCiudad / 2);
            $writeShadow($ciudad, $x, $curY, $sizeCiudad, $colorSecundario, 0.05);
        }

        // 7) Código y dominio (azul y subrayado)
        $domain = config('app.frontend_public_url') ?? url('/');
        $codigoVer = $inv->codigo_clave ?? '';
        $metaText = trim("Código: {$codigoVer} · {$domain}");
        $curY = $curY + (int) round($sizeCiudad / 2) + $gap + (int) round($sizeMeta / 2);
        $img->text($metaText, $x, $curY, function ($font) use ($fontPath, $sizeMeta, $colorPrincipal) {
            $font->filename($fontPath);
            $font->size($sizeMeta);
            $font->color($colorPrincipal);
            $font->align('center');
            $font->valign('middle');
        });

        // Dibujar subrayado aproximado bajo el texto (ancho estimado según longitud)
        $approxWidth = max(140, (int) round(mb_strlen($metaText) * ($sizeMeta * 0.55)));
        $x1 = $x - (int) round($approxWidth / 2);
        $x2 = $x + (int) round($approxWidth / 2);
        $yline = $curY + (int) round($sizeMeta * 0.65);
        $img->line($x1, $yline, $x2, $yline, function ($draw) use ($colorPrincipal) {
            $draw->color($colorPrincipal);
            $draw->width(3);
        });

        // 8) Número de pases: círculo grande en la parte inferior izquierda con número blanco
        $pasesNumber = (int) ($inv->pases ?? 1);
        $diam = max(80, (int) round(160 * $scale));
        $cx = (int) round($diam / 2 + (28 * $scale));
        $cy = $imgH - (int) round($diam / 2) - (int) round(28 * $scale);

        // Dibujar círculo lleno
        try {
            $img->circle($diam, $cx, $cy, function ($draw) use ($colorPrincipal) {
                $draw->background($colorPrincipal);
            });

            // Número de pases centrado en el círculo (blanco)
            $img->text((string) $pasesNumber, $cx, $cy, function ($font) use ($fontPath, $sizePases) {
                $font->filename($fontPath);
                $font->size($sizePases);
                $font->color('#ffffff');
                $font->align('center');
                $font->valign('middle');
            });
        } catch (\Throwable $e) {
            // Fallback: si circle no está soportado, dibujar el número en la esquina
            $bottomY = (int) round($imgH * 0.88);
            $writeShadow('Pases: ' . $pasesNumber, (int) round($imgW * 0.18), $bottomY, $sizePases, $colorPrincipal, 0.06);
        }

        // 8) Encode liviano y guardar archivos (PNG/JPG/WebP según formato solicitado)
        $bytes = match ($fmt) {
            'png'  => (string) $img->toPng(),
            'jpg', 'jpeg' => (string) $img->toJpeg(86),
            'webp' => (string) $img->toWebp(82),
            default => (string) $img->toJpeg(86),
        };

        // 9) Guardar archivo (carpeta por boda) y además generar WebP paralelo
        $folder = "tarjetas/generadas/" . ($boda?->id ?? 0);
        $slugPareja   = Str::slug($nombrePareja, '_');
        $slugInvitado = Str::slug($nombreInvitado, '_');
        $stamp        = now()->format('Ymd_His');

        $ext = $fmt === 'jpeg' ? 'jpg' : $fmt;
        $filename = ($boda?->id ?? 0) . "_{$slugPareja}_{$slugInvitado}_{$stamp}.{$ext}";
        $path = "{$folder}/{$filename}";

        Storage::disk('public')->put($path, $bytes);

        // Generar y guardar versión WebP para descargas optimizadas (si no existe)
        try {
            $webpBytes = (string) $img->encode('webp', 85);
            $pathWebp = preg_replace('/\.[^.]+$/', '.webp', $path);
            Storage::disk('public')->put($pathWebp, $webpBytes);
        } catch (\Throwable $e) {
            // No crítico: si falla la generación WebP, continuamos
            \Log::warning('No se pudo generar WebP para la tarjeta: '.$e->getMessage());
        }

        // 10) Guardar cache en BD (apuntamos al archivo principal)
        $inv->forceFill([
            'rsvp_card_path' => $path,
            'rsvp_card_hash' => $hash,
            'rsvp_card_generated_at' => now(),
        ])->saveQuietly();

        return response($bytes, 200)
            ->header('Content-Type', $this->contentTypeFromFmt($fmt))
            ->header('Content-Disposition', ($isDownload ? 'attachment' : 'inline') . '; filename="'.$this->downloadName($inv, $boda, $ext).'"')
            ->header('Cache-Control', 'public, max-age=3600');
    }

    private function contentTypeFromFmt(string $fmt): string
    {
        return match ($fmt) {
            'png'  => 'image/png',
            'jpg', 'jpeg' => 'image/jpeg',
            'webp' => 'image/webp',
            default => 'application/octet-stream',
        };
    }

    private function downloadName($inv, $boda, string $ext): string
    {
        $slugPareja   = Str::slug($boda?->nombre_pareja ?? 'boda', '_');
        $slugInvitado = Str::slug($inv->nombre_invitado ?? 'invitado', '_');
        $stamp = now()->format('Ymd_His');
        return ($boda?->id ?? 0) . "_{$slugPareja}_{$slugInvitado}_{$stamp}.{$ext}";
    }
}
