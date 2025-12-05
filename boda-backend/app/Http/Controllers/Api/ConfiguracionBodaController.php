<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Boda;
use App\Models\ConfiguracionBoda;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ConfiguracionBodaController extends Controller
{
    // -------- helpers --------
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
        'frase_principal'         => 'nullable|string|max:255',
        'texto_fecha_religioso'   => 'nullable|string|max:255',
        'texto_fecha_civil'       => 'nullable|string|max:255',
        'texto_padres_novio'      => 'nullable|string',
        'texto_padres_novia'      => 'nullable|string',
        'texto_padrinos_mayores'  => 'nullable|string',
        'texto_padrinos_civiles'  => 'nullable|string',
        'cronograma_texto'        => 'nullable|string',
        'local_religioso'         => 'nullable|string|max:255',
        'local_recepcion'         => 'nullable|string|max:255',
        'texto_cuentas_bancarias' => 'nullable|string',
        'texto_yape'              => 'nullable|string',
        'texto_historia_pareja'   => 'nullable|string',
        'texto_mensaje_final'     => 'nullable|string',
        'texto_preguntas_frecuentes' => 'nullable|string',
    ]);
}


    // ============= SUPERADMIN – apiResource (bodas.configuracion) =============

    public function show(Boda $boda)
    {
        $config = $boda->configuracion;
        return response()->json($config);
    }

    public function store(Request $request, Boda $boda)
    {
        $data = $this->validateData($request);
        $data['boda_id'] = $boda->id;

        $config = ConfiguracionBoda::create($data);

        return response()->json($config, 201);
    }

    public function update(Request $request, ConfiguracionBoda $configuracionBoda)
    {
        $data = $this->validateData($request);
        $configuracionBoda->update($data);

        return response()->json($configuracionBoda);
    }

    // ============= ADMIN_BODA – rutas /mis-bodas/... =============

    public function showPropia(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        return response()->json($boda->configuracion);
    }

    public function storePropia(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $data = $this->validateData($request);
        $data['boda_id'] = $boda->id;

        $config = ConfiguracionBoda::updateOrCreate(
            ['boda_id' => $boda->id],
            $data
        );

        return response()->json($config, 201);
    }

    public function updatePropia(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $config = $boda->configuracion;

        if (! $config) {
            return $this->storePropia($request, $boda);
        }

        $data = $this->validateData($request);
        $config->update($data);

        return response()->json($config);
    }
}
