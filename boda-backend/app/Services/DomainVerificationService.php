<?php

namespace App\Services;

/**
 * Servicio para verificar que un dominio apunta correctamente a nuestro servidor.
 */
class DomainVerificationService
{
    /**
     * Verifica si el dominio apunta a la IP esperada de nuestro servidor.
     * Retorna ['ok' => true] si está bien configurado, o ['ok' => false, 'error' => '...']
     */
    public function verifyDomain(string $domain): array
    {
        // Limpiar protocolo si viene con http/https
        $domain = preg_replace('#^https?://#i', '', $domain);
        $domain = trim($domain, '/');

        // Obtener la IP de nuestro servidor (desde config o detectar automáticamente)
        $expectedIp = config('app.server_ip');
        
        if (! $expectedIp) {
            // Si no está configurada, intentamos autodetectar (puede no funcionar en todos los casos)
            $expectedIp = gethostbyname(gethostname());
        }

        // Resolver el dominio a IP
        $resolvedIps = $this->resolveDomain($domain);

        if (empty($resolvedIps)) {
            return [
                'ok'    => false,
                'error' => 'No se pudo resolver el dominio. Verifica el registro DNS A.',
            ];
        }

        // Verificar si alguna IP coincide con la esperada
        if (! in_array($expectedIp, $resolvedIps, true)) {
            return [
                'ok'    => false,
                'error' => sprintf(
                    'El dominio apunta a %s, pero debería apuntar a %s.',
                    implode(', ', $resolvedIps),
                    $expectedIp
                ),
                'resolved_ips' => $resolvedIps,
                'expected_ip'  => $expectedIp,
            ];
        }

        return [
            'ok'          => true,
            'message'     => 'El dominio está correctamente configurado.',
            'resolved_ip' => $resolvedIps[0],
        ];
    }

    /**
     * Resuelve el dominio y devuelve las IPs asociadas.
     */
    protected function resolveDomain(string $domain): array
    {
        $records = @dns_get_record($domain, DNS_A);

        if ($records === false) {
            return [];
        }

        $ips = [];
        foreach ($records as $record) {
            if (isset($record['ip'])) {
                $ips[] = $record['ip'];
            }
        }

        return $ips;
    }

    /**
     * Verifica que el dominio no esté en uso por otra boda.
     */
    public function isDomainAvailable(string $domain, ?int $excludeBodaId = null): bool
    {
        $domain = preg_replace('#^https?://#i', '', $domain);
        $domain = trim($domain, '/');

        $query = \App\Models\Boda::where('dominio_personalizado', $domain);

        if ($excludeBodaId) {
            $query->where('id', '!=', $excludeBodaId);
        }

        return $query->doesntExist();
    }
}
