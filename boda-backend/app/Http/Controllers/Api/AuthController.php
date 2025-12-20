<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Events\PasswordReset;
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

        try {
            /** @var User|null $user */
            $user = User::where('email', $data['email'])->with('rol')->first();
        } catch (\Throwable $e) {
            Log::error('Error consultando usuario en login', [
                'email' => $data['email'] ?? null,
                'ip' => $request->ip(),
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Error interno del servidor',
            ], 500);
        }

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            return response()->json(['message' => 'Credenciales inválidas'], 401);
        }

        if (! $user->activo) {
            return response()->json(['message' => 'Usuario inactivo'], 403);
        }

        $deviceName = $data['device_name'] ?? 'api-token';

        try {
            $token = $user->createToken($deviceName)->plainTextToken;
        } catch (\Throwable $e) {
            Log::error('Error creando token Sanctum en login', [
                'user_id' => $user->id ?? null,
                'ip' => $request->ip(),
                'exception' => $e,
            ]);

            return response()->json([
                'message' => 'Error interno del servidor',
            ], 500);
        }

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
                'nombre_novio_1'          => 'Novio 1',
                'nombre_novio_2'          => 'Novio 2',
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

    /**
     * Solicitar enlace de recuperación de contraseña
     * RUTA: POST /api/auth/forgot-password
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return response()->json([
                'message' => 'Enlace de recuperación enviado a tu correo.'
            ]);
        }

        return response()->json([
            'message' => 'No se pudo enviar el enlace. Verifica tu correo.'
        ], 400);
    }

    /**
     * Restablecer contraseña
     * RUTA: POST /api/auth/reset-password
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => 'required|min:6|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password)
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Contraseña restablecida exitosamente.'
            ]);
        }

        return response()->json([
            'message' => 'No se pudo restablecer la contraseña.'
        ], 400);
    }

    /**
     * Actualizar perfil del usuario autenticado
     * RUTA: PUT /api/user/profile
     */
    public function updateProfile(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        $data = $request->validate([
            'name'     => 'sometimes|required|string|min:3',
            'telefono' => 'nullable|string|max:30',
            'password' => 'nullable|string|min:6',
        ]);

        // Actualizar nombre y teléfono
        if (isset($data['name'])) {
            $user->name = $data['name'];
        }
        if (isset($data['telefono'])) {
            $user->telefono = $data['telefono'];
        }

        // Actualizar contraseña solo si se proporcionó
        if (isset($data['password']) && $data['password']) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'Perfil actualizado correctamente',
            'usuario' => $user->load('rol')
        ]);
    }
}
