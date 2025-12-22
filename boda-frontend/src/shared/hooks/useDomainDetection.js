// src/shared/hooks/useDomainDetection.js
import { useMemo } from "react";

/**
 * Hook que detecta si estamos en un dominio personalizado de boda.
 * Se calcula de forma síncrona, sin useEffect.
 * 
 * Retorna: { isDomainBoda: boolean, domainIdentifier: string|null }
 */
export function useDomainDetection() {
  const result = useMemo(() => {
    // Dominios base de la plataforma (no son bodas personalizadas)
    const baseDomains = [
      "localhost",
      "127.0.0.1",
      "miwebdebodas.com",
      "miwebdebodas.test",
      "161.97.169.31", // IP del servidor
      "www.miwebdebodas.com",
      "www.miwebdebodas.test",
    ];

    const currentHost = window.location.hostname;
    
    // Si el host no está en los dominios base, es un dominio personalizado
    const isCustomDomain = !baseDomains.includes(currentHost);

    return {
      isDomainBoda: isCustomDomain,
      domainIdentifier: isCustomDomain ? currentHost : null,
    };
  }, []);

  return result;
}
