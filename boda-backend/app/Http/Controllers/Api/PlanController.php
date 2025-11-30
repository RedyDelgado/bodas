<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Plan;
use Illuminate\Http\Request;

class PlanController extends Controller
{
    // Público (landing)
    public function indexPublico()
    {
        $planes = Plan::where('activo', true)->get();
        return response()->json($planes);
    }

    // Superadmin CRUD
    public function index()
    {
        return response()->json(Plan::all());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre'                 => 'required|string|max:100',
            'slug'                   => 'required|string|max:50|unique:planes,slug',
            'descripcion_corta'      => 'nullable|string|max:255',
            'precio_monetario'       => 'nullable|numeric|min:0',
            'moneda'                 => 'nullable|string|max:10',
            'incluye_subdominio'     => 'boolean',
            'permite_dominio_propio' => 'boolean',
            'invitados_ilimitados'   => 'boolean',
            'activo'                 => 'boolean',
        ]);

        $plan = Plan::create($data);

        return response()->json($plan, 201);
    }

    public function show(Plan $plane) // nombre por convención de apiResource
    {
        return response()->json($plane);
    }

    public function update(Request $request, Plan $plane)
    {
        $data = $request->validate([
            'nombre'                 => 'required|string|max:100',
            'slug'                   => 'required|string|max:50|unique:planes,slug,' . $plane->id,
            'descripcion_corta'      => 'nullable|string|max:255',
            'precio_monetario'       => 'nullable|numeric|min:0',
            'moneda'                 => 'nullable|string|max:10',
            'incluye_subdominio'     => 'boolean',
            'permite_dominio_propio' => 'boolean',
            'invitados_ilimitados'   => 'boolean',
            'activo'                 => 'boolean',
        ]);

        $plane->update($data);

        return response()->json($plane);
    }

    public function destroy(Plan $plane)
    {
        $plane->delete();

        return response()->json(['message' => 'Plan eliminado']);
    }
}
