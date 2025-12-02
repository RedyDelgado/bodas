<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Boda;
use App\Models\FaqBoda;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;


class FaqBodaController extends Controller
{
   // Lista FAQs de una boda
    public function index($bodaId)
    {
        $user = Auth::user();

        // Validar que la boda pertenece al usuario (ajusta a tu lógica)
        $boda = Boda::where('id', $bodaId)
            ->where('user_id', $user->id) // o el campo que uses
            ->firstOrFail();

        $faqs = $boda->faqs()
            ->orderBy('orden')
            ->get();

        return response()->json($faqs);
    }

    // Sincroniza todas las FAQs de una boda (recibe un array y reemplaza)
    public function sync(Request $request, $bodaId)
    {
        $user = Auth::user();

        $boda = Boda::where('id', $bodaId)
            ->where('user_id', $user->id)
            ->firstOrFail();

        $data = $request->validate([
            'faqs'   => 'array',
            'faqs.*.pregunta'  => 'nullable|string|max:255',
            'faqs.*.respuesta' => 'nullable|string',
        ]);

        $faqs = collect($data['faqs'] ?? [])
            ->map(function ($item, $index) use ($boda) {
                return [
                    'boda_id'  => $boda->id,
                    'orden'    => $index + 1,
                    'pregunta' => $item['pregunta'] ?? '',
                    'respuesta'=> $item['respuesta'] ?? '',
                    'es_activa'=> true,
                ];
            })
            // Filtramos filas totalmente vacías
            ->filter(function ($item) {
                return trim($item['pregunta']) !== '' || trim($item['respuesta']) !== '';
            })
            ->values()
            ->all();

        // Estrategia simple: borrar y volver a insertar
        FaqBoda::where('boda_id', $boda->id)->delete();

        if (!empty($faqs)) {
            FaqBoda::insert($faqs);
        }

        return response()->json([
            'ok'   => true,
            'faqs' => FaqBoda::where('boda_id', $boda->id)->orderBy('orden')->get(),
        ]);
    }

    // Eliminar una FAQ específica (opcional, por si la manejas individual)
    public function destroy($faqId)
    {
        $user = Auth::user();

        $faq = FaqBoda::with('boda')->findOrFail($faqId);

        if ($faq->boda->user_id !== $user->id) {
            abort(403);
        }

        $faq->delete();

        return response()->json(['ok' => true]);
    }
}