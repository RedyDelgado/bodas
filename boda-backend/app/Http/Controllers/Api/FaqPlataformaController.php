<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FaqPlataforma;
use Illuminate\Http\Request;

class FaqPlataformaController extends Controller
{
    // Público – solo activos ordenados
    public function indexPublico()
    {
        $faqs = FaqPlataforma::where('es_activa', true)
            ->orderBy('orden')
            ->get();

        return response()->json($faqs);
    }

    // Superadmin CRUD

    public function index()
    {
        return response()->json(
            FaqPlataforma::orderBy('orden')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'orden'     => 'nullable|integer|min:1',
            'pregunta'  => 'required|string|max:255',
            'respuesta' => 'required|string',
            'es_activa' => 'boolean',
        ]);

        $faq = FaqPlataforma::create($data);

        return response()->json($faq, 201);
    }

    public function show(FaqPlataforma $faqsPlataforma)
    {
        return response()->json($faqsPlataforma);
    }

    public function update(Request $request, FaqPlataforma $faqsPlataforma)
    {
        $data = $request->validate([
            'orden'     => 'nullable|integer|min:1',
            'pregunta'  => 'sometimes|string|max:255',
            'respuesta' => 'sometimes|string',
            'es_activa' => 'boolean',
        ]);

        $faqsPlataforma->update($data);

        return response()->json($faqsPlataforma);
    }

    public function destroy(FaqPlataforma $faqsPlataforma)
    {
        $faqsPlataforma->delete();

        return response()->json(['message' => 'FAQ eliminada']);
    }
}
