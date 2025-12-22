<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #334155;
            background-color: #f8fafc;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
        }
        .header {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            padding: 40px 30px;
            text-align: center;
        }
        .header-icon {
            width: 64px;
            height: 64px;
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .header p {
            color: #cbd5e1;
            font-size: 14px;
        }
        .content {
            padding: 40px 30px;
        }
        .content h2 {
            color: #1e293b;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        .content p {
            color: #475569;
            font-size: 15px;
            margin-bottom: 16px;
            line-height: 1.7;
        }
        .button-container {
            text-align: center;
            margin: 32px 0;
        }
        .button {
            display: inline-block;
            padding: 14px 32px;
            background: linear-gradient(135deg, #1e293b 0%, #475569 100%);
            color: #ffffff;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
        }
        .button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }
        .info-box {
            background-color: #f1f5f9;
            border-left: 4px solid #64748b;
            padding: 16px;
            margin: 24px 0;
            border-radius: 4px;
        }
        .info-box p {
            color: #475569;
            font-size: 14px;
            margin: 0;
        }
        .footer {
            background-color: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
        }
        .footer p {
            color: #94a3b8;
            font-size: 13px;
            margin-bottom: 8px;
        }
        .divider {
            height: 1px;
            background-color: #e2e8f0;
            margin: 24px 0;
        }
        @media only screen and (max-width: 600px) {
            .header, .content, .footer {
                padding: 30px 20px;
            }
            .header h1 {
                font-size: 20px;
            }
            .button {
                padding: 12px 24px;
                font-size: 14px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="header-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
            </div>
            <h1>Recuperación de Contraseña</h1>
            <p>{{ config('app.name') }}</p>
        </div>

        <!-- Content -->
        <div class="content">
            <h2>¡Hola!</h2>
            <p>
                Recibimos una solicitud para restablecer la contraseña de tu cuenta en 
                <strong>{{ config('app.name') }}</strong>.
            </p>
            <p>
                Para continuar con el proceso de recuperación, haz clic en el botón de abajo:
            </p>

            <div class="button-container">
                <a href="{{ $resetUrl }}" class="button">
                    Restablecer Contraseña
                </a>
            </div>

            <div class="info-box">
                <p>
                    <strong>⏱️ Este enlace expirará en {{ $expirationMinutes }} minutos.</strong><br>
                    Por seguridad, el enlace solo puede ser usado una vez.
                </p>
            </div>

            <div class="divider"></div>

            <p style="font-size: 14px; color: #64748b;">
                Si no solicitaste restablecer tu contraseña, puedes ignorar este correo de forma segura. 
                Tu contraseña no será modificada.
            </p>

            <p style="font-size: 13px; color: #94a3b8; margin-top: 24px;">
                <strong>¿El botón no funciona?</strong> Copia y pega este enlace en tu navegador:<br>
                <a href="{{ $resetUrl }}" style="color: #3b82f6; word-break: break-all;">{{ $resetUrl }}</a>
            </p>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>{{ config('app.name') }}</strong></p>
            <p>Plataforma de gestión de páginas de boda</p>
            <p style="margin-top: 16px;">
                Este es un correo automático, por favor no respondas a este mensaje.
            </p>
        </div>
    </div>
</body>
</html>
