<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Boda;
use App\Models\Invitado;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
// NUEVO: para leer XLSX/XLS
use PhpOffice\PhpSpreadsheet\IOFactory;

class InvitadoController extends Controller
{
    protected function ensureOwnerOrAbort(Boda $boda): void
    {
        /** @var User $user */
        $user = Auth::user();

        if ($user->rol?->nombre !== 'superadmin' && $boda->user_id !== $user->id) {
            abort(403, 'No tienes permiso para esta boda');
        }
    }

    protected function validateData(Request $request, bool $isCreate = true): array
    {
        $baseRules = [
            'nombre_invitado'    => 'required|string|max:150',
            'pases'              => 'required|integer|min:1|max:10',
            'correo'             => 'nullable|email|max:150',
            'celular'            => 'nullable|string|max:30',
            'nombre_acompanante' => 'nullable|string|max:150',
            'es_confirmado'      => 'boolean',
            'notas'              => 'nullable|string|max:255',
        ];

        if ($isCreate) {
            // AHORA es opcional; si viene vacío, el modelo lo genera
            $baseRules['codigo_clave'] = 'nullable|string|max:50';
        }

        return $request->validate($baseRules);
    }

    // ================= SUPERADMIN – apiResource(bodas.invitados) ================

    public function index(Boda $boda)
    {
        return response()->json($boda->invitados()->orderBy('nombre_invitado')->get());
    }

    public function store(Request $request, Boda $boda)
    {
        $data = $this->validateData($request, true);
        $data['boda_id'] = $boda->id;

        $invitado = Invitado::create($data);

        return response()->json($invitado, 201);
    }

    public function show(Invitado $invitado)
    {
        return response()->json($invitado);
    }

    public function update(Request $request, Invitado $invitado)
    {
        $data = $this->validateData($request, false);
        $invitado->update($data);

        return response()->json($invitado);
    }

    public function destroy(Invitado $invitado)
    {
        $invitado->delete();

        return response()->json(['message' => 'Invitado eliminado']);
    }

    // ================= ADMIN_BODA – rutas /mis-bodas/... =================

    public function indexPropios(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $invitados = $boda->invitados()->orderBy('nombre_invitado')->get();

        $frontendBase = config('app.frontend_public_url'); // ej. http://localhost:5173
        $slugBoda     = $boda->subdominio;                 // importante: aquí usas tu campo real

        $data = $invitados->map(function (Invitado $inv) use ($frontendBase, $slugBoda) {
            $linkRsvp = "{$frontendBase}/boda/{$slugBoda}?code={$inv->codigo_clave}";

            return [
                'id'                 => $inv->id,
                'boda_id'            => $inv->boda_id,
                'codigo_clave'       => $inv->codigo_clave,
                'nombre_invitado'    => $inv->nombre_invitado,
                'pases'              => $inv->pases,
                'correo'             => $inv->correo,
                'celular'            => $inv->celular,
                'nombre_acompanante' => $inv->nombre_acompanante,
                'es_confirmado'      => $inv->es_confirmado,
                'fecha_confirmacion' => $inv->fecha_confirmacion,
                'notas'              => $inv->notas,
                // Campos relacionados con la tarjeta RSVP (cache)
                'rsvp_card_path'         => $inv->rsvp_card_path,
                'rsvp_card_generated_at' => $inv->rsvp_card_generated_at,
                'rsvp_card_url'          => $inv->rsvp_card_url,
                'link_rsvp'          => $linkRsvp,
            ];
        });

        return response()->json([
            'data' => $data,
        ]);
    }

    public function storePropio(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        $data = $this->validateData($request, true);
        $data['boda_id'] = $boda->id;

        $invitado = Invitado::create($data);

        return response()->json($invitado, 201);
    }

    public function showPropio(Request $request, Invitado $invitado)
    {
        $this->ensureOwnerOrAbort($invitado->boda);

        return response()->json($invitado);
    }

    public function updatePropio(Request $request, Invitado $invitado)
    {
        $this->ensureOwnerOrAbort($invitado->boda);

        $data = $this->validateData($request, false);
        $invitado->update($data);

        return response()->json($invitado);
    }

    public function destroyPropio(Request $request, Invitado $invitado)
    {
        $this->ensureOwnerOrAbort($invitado->boda);

        $invitado->delete();

        return response()->json(['message' => 'Invitado eliminado']);
    }

    public function confirmar(Request $request, Invitado $invitado)
    {
        $this->ensureOwnerOrAbort($invitado->boda);

        $invitado->es_confirmado = true;
        $invitado->fecha_confirmacion = now();
        $invitado->save();

        return response()->json([
            'message'  => 'Invitado confirmado',
            'invitado' => $invitado,
        ]);
    }

    // =============== IMPORTACIÓN DESDE ARCHIVO (CSV / XLSX) =================

    /**
     * Importa invitados para una boda del owner (ruta: /mis-bodas/{boda}/invitados/importar).
     * Lee tanto XLSX/XLS como CSV (delimitado por ';', igual que tu plantilla).
     */
    public function importarPropio(Request $request, Boda $boda)
    {
        $this->ensureOwnerOrAbort($boda);

        // Validación del archivo
        $request->validate(
            [
                'archivo' => 'required|file|mimes:xlsx,xls,csv,txt|max:5120',
            ],
            [
                'archivo.required' => 'Debes seleccionar un archivo.',
                'archivo.file'     => 'El archivo no es válido.',
                'archivo.mimes'    => 'El archivo debe ser XLSX, XLS o CSV.',
                'archivo.max'      => 'El archivo supera el tamaño máximo permitido (5 MB).',
            ]
        );

        $file       = $request->file('archivo');
        $extension  = strtolower($file->getClientOriginalExtension());
        $creados    = [];

        // ---- EXCEL (XLSX / XLS) ----
        if (in_array($extension, ['xlsx', 'xls'])) {
            $spreadsheet = IOFactory::load($file->getRealPath());
            $sheet       = $spreadsheet->getActiveSheet();
            $rows        = $sheet->toArray(null, true, true, true); // columnas A,B,C,...

            foreach ($rows as $index => $row) {
                // Fila 1 = encabezados
                if ($index === 1) {
                    continue;
                }

                $nombre = trim($row['A'] ?? '');
                if ($nombre === '') {
                    continue;
                }

                $pases   = (int)($row['B'] ?? 1);
                $celular = trim($row['C'] ?? '');

                $invitado = $boda->invitados()->create([
                    'nombre_invitado' => $nombre,
                    'pases'           => $pases > 0 ? $pases : 1,
                    'celular'         => $celular ?: null,
                ]);

                $creados[] = $invitado;
            }
        } else {
            // ---- CSV / TXT (plantilla descargada desde el frontend) ----
            if (($handle = fopen($file->getRealPath(), 'r')) !== false) {
                $rowNum = 0;

                // IMPORTANTE: delimitador ';' porque tu plantilla se genera con ';'
                while (($row = fgetcsv($handle, 0, ';')) !== false) {
                    $rowNum++;

                    // Encabezados
                    if ($rowNum === 1) {
                        continue;
                    }

                    $nombre = trim($row[0] ?? '');
                    if ($nombre === '') {
                        continue;
                    }

                    $pases   = (int)($row[1] ?? 1);
                    $celular = trim($row[2] ?? '');

                    $invitado = $boda->invitados()->create([
                        'nombre_invitado' => $nombre,
                        'pases'           => $pases > 0 ? $pases : 1,
                        'celular'         => $celular ?: null,
                    ]);

                    $creados[] = $invitado;
                }

                fclose($handle);
            }
        }

        return response()->json([
            'message'   => 'Invitados importados correctamente.',
            // Devuelvo todos los invitados ordenados para refrescar la tabla del front
            'invitados' => $boda->invitados()->orderBy('nombre_invitado')->get(),
        ]);
    }
}
