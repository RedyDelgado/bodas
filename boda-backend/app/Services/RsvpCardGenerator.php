<?php

namespace App\Services;

use App\Models\Invitado;
use App\Models\TarjetaDiseno;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;
use Intervention\Image\Encoders\PngEncoder;

class RsvpCardGenerator
{
    /**
     * Sobrescribe tarjetas antiguas por defecto (antes pedías no borrar, ahora sí)
     */
    private bool $deleteOldIfPathChanges = true;

    public function generateForInvitado(Invitado $inv, ?TarjetaDiseno $design = null): ?string
    {
        $boda = $inv->boda;

        // 1) Plantilla
        $template = $design?->plantilla_ruta
            ? Storage::disk('public')->path($design->plantilla_ruta)
            : storage_path('app/public/tarjetas/tarjeta_base.png');

        if (!file_exists($template)) {
            \Log::warning("RSVP GEN: Plantilla no encontrada", ['template' => $template, 'inv' => $inv->id]);
            return null;
        }

        \Log::info("RSVP GEN start", [
            'inv' => $inv->id,
            'boda_id' => $inv->boda_id ?? null,
            'template' => $template,
        ]);

        $img = Image::read($template);

        // Si tu PNG base es enorme, esto reduce peso MUCHO.
        // Ajusta a tu estándar real (ej: 1080x1920)
        // $img->scaleDown(width: 1080);

        $w = $img->width();
        $h = $img->height();

        // 2) Diseño
        $designJson = is_array($design?->diseno_json) ? $design->diseno_json : [];
        $placed     = $designJson['placed'] ?? [];
        $fieldsDefs = $designJson['fields'] ?? [];

        // Defaults globales del diseño
        $defaultFontFamily = (string)($designJson['fontFamily'] ?? 'CormorantGaramond-SemiBold');
        $defaultFontSize   = (int)($designJson['fontSize'] ?? 18);
        $defaultColor      = (string)($designJson['color'] ?? '#1E3A8A');

        // Fuente default (si no existe, lo registramos)
        $defaultFontPath = $this->resolveFontPath($defaultFontFamily);
        if (!$defaultFontPath) {
            \Log::warning("RSVP GEN: Fuente default no encontrada en backend/public/fonts", [
                'fontFamily' => $defaultFontFamily,
                'expected_paths' => [
                    public_path("fonts/{$defaultFontFamily}.ttf"),
                    public_path("fonts/{$defaultFontFamily}.otf"),
                ],
            ]);
        }

        // 3) Pintar textos
        foreach ($placed as $p) {
            $field = $p['field'] ?? null;
            if (!$field) continue;

            $x = (float)($p['x'] ?? 50);
            $y = (float)($p['y'] ?? 50);

            $fontSize   = (int)($p['fontSize'] ?? $defaultFontSize);
            $fontFamily = (string)($p['fontFamily'] ?? $defaultFontFamily);
            $color      = (string)($p['color'] ?? $defaultColor);

            // mapping (si existe)
            $mapped = null;
            foreach ($fieldsDefs as $fd) {
                if (($fd['key'] ?? null) === $field) {
                    $mapped = $fd['mappedTo'] ?? null;
                    break;
                }
            }

            $text = $mapped
                ? $this->valueFromMapping($inv, $boda, $mapped)
                : $this->valueForField($inv, $field, $boda);

            $text = $this->normalizeText($text);

            // Resuelve fuente por elemento; si no existe, usa default
            $fontPath = $this->resolveFontPath($fontFamily) ?: $defaultFontPath;

            // Soporte robusto de unidades: porcentaje, fracción (0..1) o píxeles
            $pxX = $x;
            $pxY = $y;
            // fracciones 0..1
            if ($x > 0 && $x <= 1 && $y > 0 && $y <= 1) {
                $pxX = (int) round($w * $x);
                $pxY = (int) round($h * $y);
            }
            // porcentajes 0..100
            elseif ($x >= 0 && $x <= 100 && $y >= 0 && $y <= 100 && ($p['units'] ?? 'percent') === 'percent') {
                $pxX = (int) round($w * ($x / 100));
                $pxY = (int) round($h * ($y / 100));
            }
            // heurística: si excede 100 pero menor al ancho/alto, tratamos como píxeles
            else {
                $pxX = (int) round(min(max($x, 0), $w));
                $pxY = (int) round(min(max($y, 0), $h));
            }

            $img->text(
                $text,
                (int) $pxX,
                (int) $pxY,
                function ($font) use ($fontPath, $fontSize, $color) {
                    if ($fontPath) $font->file($fontPath);
                    $font->size(max(6, $fontSize));
                    $font->color($color);
                    $font->align('center');
                    $font->valign('middle');
                }
            );
        }

        // 4) Nombre obligatorio: idBoda_nombre_pareja_nombre_invitado.png
        $bodaId = (int)($boda?->id ?? 0);
        $folder = "tarjetas/generadas/{$bodaId}";

        $slugPareja = Str::slug((string)($boda?->nombre_pareja ?? 'boda'), '_');
        $slugInv    = Str::slug((string)($inv->nombre_invitado ?? 'invitado'), '_');

        $filename = "{$bodaId}_{$slugPareja}_{$slugInv}.jpg";

        // Evita nombres exagerados
        if (strlen($filename) > 180) {
            $filename = substr($filename, 0, 170) . ".jpg";
        }

        $path = "{$folder}/{$filename}";

        // 5) Sobrescribir: eliminar tarjeta anterior si existe una diferente
        // 5) Opcional: borrar archivos antiguos si el path cambió
        $old = $inv->rsvp_card_path;
        if ($old && $old !== $path && Storage::disk('public')->exists($old)) {
            try {
                Storage::disk('public')->delete($old);
                \Log::debug("RSVP GEN deleted old file", ['old_path' => $old, 'new_path' => $path]);
            } catch (\Throwable $delErr) {
                \Log::warning("RSVP GEN failed to delete old: " . $delErr->getMessage());
            }
        }


        // 6) Encode JPEG (más liviano, calidad 88)
        $bytes = $this->encodeJpeg($img);

        \Log::info("RSVP GEN encoded", [
            'inv' => $inv->id,
            'path' => $path,
            'bytes' => strlen((string)$bytes),
        ]);

        // 7) Guardar (SOBRESCRIBE si existe mismo path)
        $ok = Storage::disk('public')->put($path, $bytes);

        \Log::info("RSVP GEN saved", [
            'inv' => $inv->id,
            'ok' => $ok,
            'path' => $path,
            'disk_root' => config('filesystems.disks.public.root'),
        ]);

        if (!$ok) {
            \Log::error("RSVP GEN failed saving", ['inv' => $inv->id, 'path' => $path]);
            return null;
        }

        // 8) Persistir en BD
        $inv->rsvp_card_path = $path;
        $inv->rsvp_card_generated_at = now();
        $inv->rsvp_card_hash = hash('sha256', json_encode([$inv->id, (string)$inv->updated_at]));
        $inv->saveQuietly();

        return $path;
    }

    private function encodeJpeg($img): string
    {
        // JPEG calidad 88/100 (ajustable)
        try {
            return (string) $img->encode('jpg', 88);
        } catch (\Throwable $e) {
            \Log::error('RSVP GEN: JPEG encode failed', [
                'e' => $e->getMessage(),
            ]);
            // Fallback: PNG si falla JPEG
            return (string) $img->encode('png', 9);
        }
    }

    private function valueForField(Invitado $inv, $field, $boda): string
    {
        return match ($field) {
            'nombre_invitado' => (string) ($inv->nombre_invitado ?? ''),
            'nombre_pareja'   => (string) ($boda?->nombre_pareja ?? ''),
            'fecha_boda'      => $boda?->fecha_boda?->format('d M Y') ?? (string) ($boda?->fecha_boda ?? ''),
            'ciudad'          => (string) ($boda?->ciudad ?? ''),
            'codigo_clave'    => (string) ($inv->codigo_clave ?? ''),
            'pases'           => (string) ($inv->pases ?? 1),
            default           => '',
        };
    }

    private function valueFromMapping(Invitado $inv, $boda, string $mapped): string
    {
        $parts = explode('.', $mapped, 2);
        if (count($parts) !== 2) return '';
        [$scope, $attr] = $parts;

        return match ($scope) {
            'invitado' => (string) ($inv->{$attr} ?? ''),
            'boda'     => (string) ($boda->{$attr} ?? ''),
            default    => '',
        };
    }

    private function resolveFontPath(?string $name): ?string
    {
        if (!$name) return null;

        $name = trim($name);

        $candidates = [
            public_path("fonts/{$name}"),
            public_path("fonts/{$name}.ttf"),
            public_path("fonts/{$name}.otf"),
        ];

        foreach ($candidates as $p) {
            if (is_file($p)) return $p;
        }

        return null;
    }

    private function normalizeText($text): string
    {
        $text = (string)($text ?? '');
        $text = trim(preg_replace('/\s+/', ' ', $text));
        if ($text === '') return '';

        // Normalización unicode (tildes/ñ)
        if (class_exists(\Normalizer::class)) {
            $norm = \Normalizer::normalize($text, \Normalizer::FORM_C);
            if ($norm) $text = $norm;
        }

        // OJO: iconv puede deformar caracteres según entorno.
        // Si notas que “Sofía” sale raro, COMENTA este bloque.
        if (function_exists('iconv')) {
            $converted = @iconv('UTF-8', 'Windows-1252//TRANSLIT', $text);
            if ($converted !== false) $text = $converted;
        }

        return $text;
    }
}
