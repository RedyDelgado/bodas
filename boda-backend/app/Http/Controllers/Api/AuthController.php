<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Models\{ Role, Plan, Plantilla, Boda, ConfiguracionBoda };

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
            'device_name' => 'nullable|string',
        ]);

        /** @var User|null $user */
        $user = User::where('email', $data['email'])->with('rol')->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        if (! $user->activo) {
            return response()->json(['message' => 'Usuario inactivo'], 403);
        }

        $deviceName = $data['device_name'] ?? 'api-token';
        $token = $user->createToken($deviceName)->plainTextToken;

        return response()->json([
            'token'   => $token,
            'usuario' => $user,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user()->load('rol'));
    }

    public function logout(Request $request)
    {
        /** @var User $user */
        $user = $request->user();
        $user->currentAccessToken()?->delete();

        return response()->json(['message' => 'Sesión cerrada correctamente']);
    }

    /**
     * Registro de usuario y creación automática de una boda básica.
     * RUTA: POST /api/auth/register
     */
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'            => 'required|string|min:3',
            'email'           => 'required|email|unique:users,email',
            'password'        => 'required|string|min:6',
            'nombre_pareja'   => 'required|string|min:3',
            'subdominio'      => 'required|alpha_dash|unique:bodas,subdominio',
            'fecha_boda'      => 'nullable|date',
            'ciudad'          => 'nullable|string',
        ]);

        DB::beginTransaction();
        try {
            // Rol por defecto: admin_boda
            $rolAdminBoda = Role::where('nombre', 'admin_boda')->first();
            if (! $rolAdminBoda) {
                throw new \Exception('Rol admin_boda no encontrado. Ejecuta RolesSeeder.');
            }

            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'rol_id'   => $rolAdminBoda->id,
                'activo'   => true,
            ]);

            // Plan por defecto: subdominio
            $plan = Plan::where('slug', 'subdominio')->first();
            if (! $plan) {
                throw new \Exception('Plan subdominio no encontrado. Ejecuta PlanesSeeder.');
            }

            // Plantilla por defecto: primera activa
            $plantilla = Plantilla::where('es_activa', true)->first();
            if (! $plantilla) {
                throw new \Exception('No hay plantillas activas. Ejecuta PlantillasSeeder.');
            }

            $subdominio = Str::slug($data['subdominio']);

            $boda = Boda::create([
                'user_id'                 => $user->id,
                'plan_id'                 => $plan->id,
                'plantilla_id'            => $plantilla->id,
                'nombre_pareja'           => $data['nombre_pareja'],
                'nombre_novio_1'          => null,
                'nombre_novio_2'          => null,
                'correo_contacto'         => $data['email'],
                'fecha_boda'              => $data['fecha_boda'] ?? null,
                'ciudad'                  => $data['ciudad'] ?? null,
                'subdominio'              => $subdominio,
                'usa_subdominio'          => true,
                'usa_dominio_personalizado' => false,
                'estado'                  => 'borrador',
                'total_invitados'         => 0,
                'total_confirmados'       => 0,
            ]);

            ConfiguracionBoda::create([
                'boda_id' => $boda->id,
                'frase_principal' => '¡Nos casamos!',
            ]);

            DB::commit();

            $token = $user->createToken('api-token')->plainTextToken;
            return response()->json([
                'token'   => $token,
                'usuario' => $user->load('rol'),
                'boda'    => $boda,
            ], 201);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'No se pudo completar el registro',
                'error'   => $e->getMessage(),
            ], 422);
        }
    }
}
