<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plantilla;
use Illuminate\Http\Request;

class PlantillaController extends Controller
{
    // Público (landing)
    public function indexPublico()
    {
        $plantillas = Plantilla::where('es_activa', true)->get();
        return response()->json($plantillas);
    }

    // Superadmin CRUD
    public function index()
    {
        return response()->json(Plantilla::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'            => 'required|string|max:100',
            'slug'              => 'required|string|max:50|unique:plantillas,slug',
            'descripcion_corta' => 'nullable|string|max:255',
            'es_activa'         => 'boolean',
            'preview_imagen_url'=> 'nullable|string|max:255',
        ]);

        $plantilla = Plantilla::create($data);

        return response()->json($plantilla, 201);
    }

    public function show(Plantilla $plantilla)
    {
        return response()->json($plantilla);
    }

    public function update(Request $request, Plantilla $plantilla)
    {
        $data = $request->validate([
            'nombre'            => 'required|string|max:100',
            'slug'              => 'required|string|max:50|unique:plantillas,slug,' . $plantilla->id,
            'descripcion_corta' => 'nullable|string|max:255',
            'es_activa'         => 'boolean',
            'preview_imagen_url'=> 'nullable|string|max:255',
        ]);

        $plantilla->update($data);

        return response()->json($plantilla);
    }

    public function destroy(Plantilla $plantilla)
    {
        $plantilla->delete();

        return response()->json(['message' => 'Plantilla eliminada']);
    }
}
