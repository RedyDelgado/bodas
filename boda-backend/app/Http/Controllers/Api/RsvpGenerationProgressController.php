<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\RsvpGenerationProgress;
use Illuminate\Http\Request;

class RsvpGenerationProgressController extends Controller
{
    public function show(Request $request, int $bodaId)
    {
        // si tienes auth, protege con middleware sanctum y valida que el usuario sea dueño de la boda
        return response()->json(RsvpGenerationProgress::get($bodaId));
    }
}
