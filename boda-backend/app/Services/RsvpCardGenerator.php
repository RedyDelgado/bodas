<?php

namespace App\Services;

use Intervention\Image\ImageManagerStatic as Image;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\Invitado;
use App\Models\TarjetaDiseno;

class RsvpCardGenerator
{
    public function generateForInvitado(Invitado $inv, ?TarjetaDiseno $design = null): ?string
    {
        $boda = $inv->boda;

        // template path: prefer design template, fallback to base
            $template = $design?->plantilla_ruta ? Storage::disk('public')->path($design->plantilla_ruta) : storage_path('app/public/tarjetas/tarjeta_base.png');
        if (!file_exists($template)) return null;

        $img = Image::make($template);
        $w = $img->width();
        $h = $img->height();

        $fontPath = public_path('fonts/CormorantGaramond-SemiBold.ttf');
        if (!file_exists($fontPath)) {
            $fontPath = null;
        }

            $placed = $design?->diseno_json['placed'] ?? [];

        $color = '#1E3A8A';

        // Load fields definitions (labels/mapping) from design
            $fieldsDefs = $design?->diseno_json['fields'] ?? [];

        foreach ($placed as $p) {
            $field = $p['field'] ?? null;
            $x = $p['x'] ?? 50; // percent
            $y = $p['y'] ?? 50;
                $fontSize = ($design?->diseno_json['fontSize'] ?? 18);
                $fontFamily = ($design?->diseno_json['fontFamily'] ?? null);

            // If field has mapping in fieldsDefs, use mapping
            $mapped = null;
            foreach ($fieldsDefs as $fd) {
                if (($fd['key'] ?? null) === $field) {
                    $mapped = $fd['mappedTo'] ?? null;
                    break;
                }
            }

            if ($mapped) {
                $text = $this->valueFromMapping($inv, $boda, $mapped);
            } else {
                $text = $this->valueForField($inv, $field, $boda);
            }

            $img->text($text, (int) round($w * ($x / 100)), (int) round($h * ($y / 100)), function ($font) use ($fontPath, $fontSize, $color) {
                if ($fontPath) $font->file($fontPath);
                $font->size((int)$fontSize);
                $font->color($color);
                $font->align('center');
                $font->valign('middle');
            });
        }

        // save
        $folder = "tarjetas/generadas/" . ($boda?->id ?? 0);
        $slugPareja = Str::slug($boda?->nombre_pareja ?? 'boda', '_');
        $slugInv = Str::slug($inv->nombre_invitado ?? 'invitado', '_');
        $stamp = now()->format('Ymd_His');
        $filename = ($boda?->id ?? 0) . "_{$slugPareja}_{$slugInv}_{$stamp}.png";
        $path = "{$folder}/{$filename}";

        Storage::disk('public')->put($path, (string) $img->encode('png'));

        // update invitado
        $inv->rsvp_card_path = $path;
        $inv->rsvp_card_generated_at = now();
        $inv->rsvp_card_hash = hash('sha256', json_encode([$inv->id, $inv->updated_at]));
        $inv->saveQuietly();

        return $path;
    }
    
    private function valueForField(Invitado $inv, $field, $boda)
    {
        return match ($field) {
            'nombre_invitado' => $inv->nombre_invitado ?? '',
            'nombre_pareja'   => $boda?->nombre_pareja ?? '',
            'fecha_boda'      => $boda?->fecha_boda?->format('d M Y') ?? (string) ($boda?->fecha_boda ?? ''),
            'ciudad'          => $boda?->ciudad ?? '',
            'codigo_clave'    => $inv->codigo_clave ?? '',
            'pases'           => (string) ($inv->pases ?? 1),

            default           => '',
        };
    }


    private function valueFromMapping(Invitado $inv, $boda, string $mapped)
    {
        // mapped examples: "invitado.nombre_invitado" or "boda.ciudad"
        $parts = explode('.', $mapped, 2);
        if (count($parts) !== 2) return '';
        [$scope, $attr] = $parts;
        return match ($scope) {
            'invitado' => (string) ($inv->{$attr} ?? ''),
            'boda' => (string) ($boda->{$attr} ?? ''),
            default => '',
        };
    }
}
