<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    /**
     * El token de reseteo de contraseña.
     */
    public $token;

    /**
     * La URL del frontend
     */
    protected $frontendUrl;

    /**
     * Create a new notification instance.
     */
    public function __construct($token)
    {
        $this->token = $token;
        $this->frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $resetUrl = "{$this->frontendUrl}/reset-password?token={$this->token}&email=" . urlencode($notifiable->email);
        $expirationMinutes = config('auth.passwords.'.config('auth.defaults.passwords').'.expire', 60);

        return (new MailMessage)
            ->subject('Recuperación de Contraseña - ' . config('app.name'))
            ->view('emails.reset-password', [
                'resetUrl' => $resetUrl,
                'expirationMinutes' => $expirationMinutes,
            ]);
    }

    /**
     * Get the array representation of the notification.
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
