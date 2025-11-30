<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Boda;
use App\Models\FotoBoda;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

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

    protected function validateData(Request $request): array
    {
        return $request->validate([
            'url_imagen'        => 'required|string|max:255',
            'titulo'            => 'nullable|string|max:150',
            'descripcion'       => 'nullable|string|max:255',
            'orden'             => 'nullable|integer|min:1',
            'es_portada'        => 'boolean',
            'es_galeria_privada'=> 'boolean',
        ]);
    }

    // =============== SUPERADMIN – apiResource(bodas.fotos) =================

    public function index(Boda $boda)
    {
        return response()->json($boda->fotos()->orderBy('orden')->get());
    }

    public function show(FotoBoda $foto)
    {
        return response()->json($foto);
    }

    public function store(Request $request, Boda $boda)
    {
        $data = $this->validateData($request);
        $data['boda_id'] = $boda->id;

        $foto = FotoBoda::create($data);

        return response()->json($foto, 201);
    }

    public function update(Request $request, FotoBoda $foto)
    {
        $data = $this->validateData($request);
        $foto->update($data);

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

        return response()->json($boda->fotos()->orderBy('orden')->get());
    }

    public function storePropia(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $data = $this->validateData($request);
        $data['boda_id'] = $boda->id;

        $foto = FotoBoda::create($data);

        return response()->json($foto, 201);
    }

    public function updatePropia(Request $request, FotoBoda $foto)
    {
        $this->ensureOwnerOrAbort($foto->boda);

        $data = $this->validateData($request);
        $foto->update($data);

        return response()->json($foto);
    }

    public function destroyPropia(FotoBoda $foto)
    {
        $this->ensureOwnerOrAbort($foto->boda);

        $foto->delete();

        return response()->json(['message' => 'Foto eliminada']);
    }
}
