<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AjusteMarca;
use Illuminate\Http\Request;

class AjusteMarcaController extends Controller
{
    // Público – devuelve solo uno (el primero activo)
    public function showPublico()
    {
        $ajuste = AjusteMarca::where('activo', true)->first();
        return response()->json($ajuste);
    }

    // Superadmin

    public function index()
    {
        return response()->json(AjusteMarca::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre_plataforma'        => 'required|string|max:150',
            'logo_url'                 => 'nullable|string|max:255',
            'color_principal'          => 'nullable|string|max:7',
            'color_secundario'         => 'nullable|string|max:7',
            'color_acento'             => 'nullable|string|max:7',
            'texto_politica_privacidad'=> 'nullable|string',
            'texto_terminos_condiciones'=> 'nullable|string',
            'activo'                   => 'boolean',
        ]);

        // Si se activa uno, puedes desactivar los demás
        if (($data['activo'] ?? false) === true) {
            AjusteMarca::where('id', '!=', 0)->update(['activo' => false]);
        }

        $ajuste = AjusteMarca::create($data);

        return response()->json($ajuste, 201);
    }

    public function show(AjusteMarca $ajustesMarca)
    {
        return response()->json($ajustesMarca);
    }

    public function update(Request $request, AjusteMarca $ajustesMarca)
    {
        $data = $request->validate([
            'nombre_plataforma'        => 'sometimes|string|max:150',
            'logo_url'                 => 'nullable|string|max:255',
            'color_principal'          => 'nullable|string|max:7',
            'color_secundario'         => 'nullable|string|max:7',
            'color_acento'             => 'nullable|string|max:7',
            'texto_politica_privacidad'=> 'nullable|string',
            'texto_terminos_condiciones'=> 'nullable|string',
            'activo'                   => 'boolean',
        ]);

        if (array_key_exists('activo', $data) && $data['activo'] === true) {
            AjusteMarca::where('id', '!=', $ajustesMarca->id)->update(['activo' => false]);
        }

        $ajustesMarca->update($data);

        return response()->json($ajustesMarca);
    }

    public function destroy(AjusteMarca $ajustesMarca)
    {
        $ajustesMarca->delete();
        return response()->json(['message' => 'Ajuste eliminado']);
    }
}
