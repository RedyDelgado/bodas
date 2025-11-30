<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invitado;
use App\Models\LogWhatsappEnvio;
use Illuminate\Http\Request;

class LogWhatsappEnvioController extends Controller
{
    // SUPERADMIN – index/show/destroy

    public function index()
    {
        $logs = LogWhatsappEnvio::with('invitado.boda')->orderByDesc('created_at')->paginate(50);
        return response()->json($logs);
    }

    public function show(LogWhatsappEnvio $logsWhatsapp)
    {
        return response()->json($logsWhatsapp->load('invitado.boda'));
    }

    public function destroy(LogWhatsappEnvio $logsWhatsapp)
    {
        $logsWhatsapp->delete();
        return response()->json(['message' => 'Log eliminado']);
    }

    // ADMIN_BODA – enviar mensaje a invitado (simulado)

    public function enviarMensajeInvitado(Request $request, Invitado $invitado)
    {
        // Aquí podrías validar también que el usuario sea dueño de la boda
        // usando el mismo helper ensureOwnerOrAbort si lo extraes a un trait.

        $data = $request->validate([
            'telefono'  => 'required|string|max:30',
            'mensaje'   => 'required|string',
        ]);

        // TODO: integrar proveedor real (Twilio, etc.)
        // De momento solo registramos el intento.
        $log = LogWhatsappEnvio::create([
            'invitado_id'      => $invitado->id,
            'telefono_enviado' => $data['telefono'],
            'contenido_mensaje'=> $data['mensaje'],
            'estado_envio'     => 'simulado',
            'respuesta_gateway'=> 'ENVÍO_SIMULADO',
            'enviado_en'       => now(),
        ]);

        return response()->json([
            'message' => 'Mensaje registrado (simulado)',
            'log'     => $log,
        ]);
    }
}
