<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Boda;
use App\Models\FotoBoda;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class FotoBodaController extends Controller
{
    protected function ensureOwnerOrAbort(Boda $boda): void
    {
        /** @var User $user */
        $user = Auth::user();

        if ($user->rol?->nombre !== 'superadmin' && $boda->user_id !== $user->id) {
            abort(403, 'No tienes permiso para esta boda');
        }
    }

    /**
     * Validación genérica para crear/editar fotos cuando se envía URL
     * (apiResource de superadmin).
     */
    protected function validateData(Request $request): array
    {
        return $request->validate([
            'url_imagen'         => 'nullable|string|max:255',
            'titulo'             => 'nullable|string|max:150',
            'descripcion'        => 'nullable|string|max:255',
            'orden'              => 'nullable|integer|min:1',
            'es_portada'         => 'boolean',
            'es_galeria_privada' => 'boolean',
        ]);
    }

    /**
     * Construye una URL pública para la imagen.
     */
    protected function buildPublicUrl(FotoBoda $foto): ?string
    {
        $url = $foto->url_imagen ?? null;

        if (!$url) {
            return null;
        }

        if (str_starts_with($url, 'http://') || str_starts_with($url, 'https://')) {
            return $url;
        }

        $path = ltrim($url, '/');

        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, strlen('storage/'));
        }

        return '/storage/' . $path;
    }


    // =============== SUPERADMIN – apiResource(bodas.fotos) =================

    public function index(Boda $boda)
    {
        $fotos = $boda->fotos()->orderBy('orden')->get();

        $fotos->transform(function (FotoBoda $foto) {
            $foto->url_publica = $this->buildPublicUrl($foto);
            return $foto;
        });

        return response()->json($fotos);
    }

    public function show(FotoBoda $foto)
    {
        $foto->url_publica = $this->buildPublicUrl($foto);

        return response()->json($foto);
    }

    public function store(Request $request, Boda $boda)
    {
        $data = $this->validateData($request);
        $data['boda_id'] = $boda->id;

        $foto = FotoBoda::create($data);
        $foto->url_publica = $this->buildPublicUrl($foto);

        return response()->json($foto, 201);
    }

    public function update(Request $request, FotoBoda $foto)
    {
        $data = $this->validateData($request);
        $foto->update($data);
        $foto->refresh();

        $foto->url_publica = $this->buildPublicUrl($foto);

        return response()->json($foto);
    }

    public function destroy(FotoBoda $foto)
    {
        $foto->delete();

        return response()->json(['message' => 'Foto eliminada']);
    }

    // =============== ADMIN_BODA – rutas /mis-bodas/... =================

    public function indexPropias(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $fotos = $boda->fotos()->orderBy('orden')->get();

        $fotos->transform(function (FotoBoda $foto) {
            $foto->url_publica = $this->buildPublicUrl($foto);
            return $foto;
        });

        return response()->json($fotos);
    }

    public function storePropia(Request $request, Boda $boda)
    {
        $request->validate([
            'imagen'      => 'required|image|max:10240', // 10MB
            'titulo'      => 'nullable|string|max:150',
            'descripcion' => 'nullable|string|max:255',
        ], [
            'imagen.required' => 'Debes seleccionar una imagen.',
            'imagen.image'    => 'El archivo debe ser una imagen válida.',
            'imagen.max'      => 'La imagen supera el tamaño máximo permitido (10 MB).',
        ]);

        if (! $request->hasFile('imagen')) {
            return response()->json([
                'message' => 'No se recibió ningún archivo de imagen.',
            ], 422);
        }

        $file = $request->file('imagen');

        // Datos para el nombre del archivo
        $timestamp    = now()->format('Ymd_His');
        $slugPareja   = Str::slug($boda->nombre_pareja ?? 'boda');
        $extension    = 'jpg';
        $filename     = "{$timestamp}_{$slugPareja}_boda-{$boda->id}.{$extension}";

        try {
            $tmpPath = $file->getRealPath();

            // Cargar imagen con GD (usa imagecreatefromstring para soportar varios formatos)
            $contents = file_get_contents($tmpPath);
            if ($contents === false) {
                throw new \RuntimeException('No se pudo leer el archivo temporal de la imagen.');
            }

            $srcImg = imagecreatefromstring($contents);
            if (! $srcImg) {
                throw new \RuntimeException('Tipo de imagen no soportado o archivo corrupto.');
            }

            // Manejar orientación EXIF para JPEG
            $mime = $file->getClientMimeType();
            if ($mime === 'image/jpeg' && function_exists('exif_read_data')) {
                try {
                    $exif = @exif_read_data($tmpPath);
                    if (!empty($exif['Orientation'])) {
                        $orientation = (int) $exif['Orientation'];
                        switch ($orientation) {
                            case 2: // flip horizontal
                                if (function_exists('imageflip')) imageflip($srcImg, IMG_FLIP_HORIZONTAL);
                                break;
                            case 3: // 180 rotate
                                $srcImg = imagerotate($srcImg, 180, 0);
                                break;
                            case 4: // flip vertical
                                if (function_exists('imageflip')) imageflip($srcImg, IMG_FLIP_VERTICAL);
                                break;
                            case 5: // transpose
                                $srcImg = imagerotate($srcImg, 270, 0);
                                if (function_exists('imageflip')) imageflip($srcImg, IMG_FLIP_HORIZONTAL);
                                break;
                            case 6: // 90 CW
                                $srcImg = imagerotate($srcImg, 270, 0);
                                break;
                            case 7: // transverse
                                $srcImg = imagerotate($srcImg, 90, 0);
                                if (function_exists('imageflip')) imageflip($srcImg, IMG_FLIP_HORIZONTAL);
                                break;
                            case 8: // 90 CCW
                                $srcImg = imagerotate($srcImg, 90, 0);
                                break;
                        }
                    }
                } catch (\Throwable $e) {
                    // no fatal: continuar sin orientación EXIF
                }
            }

            $origW = imagesx($srcImg);
            $origH = imagesy($srcImg);

            // Calcular nuevas dimensiones
            $max = 1920;
            if ($origH > $origW) {
                $newH = min($max, $origH);
                $newW = (int) round($origW * ($newH / $origH));
            } else {
                $newW = min($max, $origW);
                $newH = (int) round($origH * ($newW / $origW));
            }

            $dst = imagecreatetruecolor($newW, $newH);
            // Fondo blanco para evitar bandas transparentes al convertir a JPEG
            $white = imagecolorallocate($dst, 255, 255, 255);
            imagefill($dst, 0, 0, $white);

            imagecopyresampled($dst, $srcImg, 0, 0, 0, 0, $newW, $newH, $origW, $origH);

            // Volcar a buffer como JPEG calidad 82
            ob_start();
            imagejpeg($dst, null, 82);
            $jpegData = ob_get_clean();

            if ($jpegData === false || $jpegData === '') {
                throw new \RuntimeException('Error al codificar la imagen a JPEG.');
            }

            // Guardar en disco 'public'
            $path = 'fotos_boda/' . $boda->id . '/' . $filename;
            Storage::disk('public')->put($path, $jpegData);

            // Liberar recursos
            imagedestroy($srcImg);
            imagedestroy($dst);

            // Siguiente orden
            $nextOrden = (int) ($boda->fotos()->max('orden') ?? 0) + 1;

            $foto = FotoBoda::create([
                'boda_id'     => $boda->id,
                'url_imagen'  => $path,
                'titulo'      => $request->input('titulo'),
                'descripcion' => $request->input('descripcion'),
                'orden'       => $nextOrden,
                'es_portada'  => false,
            ]);

            $foto->url_publica = $this->buildPublicUrl($foto);

            return response()->json($foto, 201);
        } catch (\Exception $e) {
            logger()->error('Error al procesar imagen en storePropia (GD): ' . $e->getMessage(), [
                'boda_id' => $boda->id,
            ]);

            return response()->json([
                'message' => 'Error al procesar la imagen.',
                'error'   => $e->getMessage(),
            ], 500);
        }
    }



    public function updatePropia(Request $request, FotoBoda $foto)
    {
        $this->ensureOwnerOrAbort($foto->boda);

        $data = $request->validate([
            'titulo'             => 'nullable|string|max:150',
            'descripcion'        => 'nullable|string|max:255',
            'orden'              => 'nullable|integer|min:1',
            'es_portada' => 'sometimes|boolean',
            'es_galeria_privada' => 'sometimes|boolean',
        ]);

        // 2) Aplicar cambios recibidos
        $foto->fill($data);

        // 3) REGLA: si se marca privada, NO puede ser portada
        if ($request->has('es_galeria_privada') && $request->boolean('es_galeria_privada') === true) {
            $foto->es_portada = 0;
        }

        // 4) Si es_portada=true, (opcional recomendado) desmarca otras portadas de la boda
        if ($request->has('es_portada') && $request->boolean('es_portada') === true) {
            // seguridad extra: no permitir portada si es privada
            if ($foto->es_galeria_privada) {
                return response()->json(['message' => 'Una foto privada no puede ser portada.'], 422);
            }

            FotoBoda::where('boda_id', $foto->boda_id)
                ->where('id', '!=', $foto->id)
                ->update(['es_portada' => 0]);

            $foto->es_portada = 1;
        }

        // 5) Guardar
        $foto->save();

        return response()->json($foto);
    }

    public function destroyPropia(FotoBoda $foto)
    {
        $this->ensureOwnerOrAbort($foto->boda);

        // Si quisieras, también podrías borrar el archivo físico:
        // if ($foto->url_imagen && !str_starts_with($foto->url_imagen, 'http')) {
        //     Storage::disk('public')->delete($foto->url_imagen);
        // }

        $foto->delete();

        return response()->json(['message' => 'Foto eliminada']);
    }

    /**
     * Reordenar fotos de la boda (drag & drop).
     * PUT /mis-bodas/{boda}/fotos/orden
     * body: { fotos: [ { "id": 10, "orden": 1 }, ... ] }
     */
    public function reordenarPropias(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $data = $request->validate([
            'fotos'         => 'required|array',
            'fotos.*.id'    => 'required|integer|exists:fotos_boda,id',
            'fotos.*.orden' => 'required|integer|min:1',
        ]);

        foreach ($data['fotos'] as $item) {
            FotoBoda::where('id', $item['id'])
                ->where('boda_id', $boda->id)
                ->update(['orden' => $item['orden']]);
        }

        return response()->json(['message' => 'Orden de fotos actualizado.']);
    }
}
