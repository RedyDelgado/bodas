<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Boda;
use App\Models\FotoBoda;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image; // para comprimir/redimensionar
use Intervention\Image\Encoders\JpegEncoder;
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

    return asset('storage/' . ltrim($url, '/'));
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
        'imagen'      => 'required|image|max:3072', // 3MB
        'titulo'      => 'nullable|string|max:150',
        'descripcion' => 'nullable|string|max:255',
    ], [
        'imagen.required' => 'Debes seleccionar una imagen.',
        'imagen.image'    => 'El archivo debe ser una imagen válida.',
        'imagen.max'      => 'La imagen supera el tamaño máximo permitido (3 MB).',
    ]);

    if (! $request->hasFile('imagen')) {
        return response()->json([
            'message' => 'No se recibió ningún archivo de imagen.',
        ], 422);
    }

    $file = $request->file('imagen');

    // Datos para el nombre del archivo
    $timestamp    = now()->format('Ymd_His');           // 20251202_110158
    $slugPareja   = Str::slug($boda->nombre_pareja ?? 'boda');
    $extension    = 'jpg';
    $filename     = "{$timestamp}_{$slugPareja}_boda-{$boda->id}.{$extension}";

    // 1) Redimensionar (máx. 1600x1600)1920×1280
    $image = Image::read($file)->resize(1920, 1280, function ($constraint) {
        $constraint->aspectRatio();
        $constraint->upsize();
    });

    // 2) Codificar a JPEG con calidad 82
    $encoded = $image->encode(new JpegEncoder(quality: 82));

    // 3) Guardar en disco 'public' (organizado por boda)
    $path = 'fotos_boda/' . $boda->id . '/' . $filename;
    Storage::disk('public')->put($path, (string) $encoded);

    // 4) Siguiente orden
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
}



    public function updatePropia(Request $request, FotoBoda $foto)
    {
        $this->ensureOwnerOrAbort($foto->boda);

        $data = $request->validate([
            'titulo'             => 'nullable|string|max:150',
            'descripcion'        => 'nullable|string|max:255',
            'orden'              => 'nullable|integer|min:1',
            'es_portada'         => 'boolean',
            'es_galeria_privada' => 'boolean',
        ]);

        $foto->update($data);
        $foto->refresh();

        $foto->url_publica = $this->buildPublicUrl($foto);

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
