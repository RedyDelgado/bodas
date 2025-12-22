// src/shared/hooks/useDomainDetection.js
import { useEffect, useState } from "react";

/**
 * Hook que detecta si estamos en un dominio personalizado de boda
 * y extrae el slug/dominio para cargar la boda correspondiente.
 * 
 * Retorna: { isDomainBoda: boolean, domainIdentifier: string|null }
 */
export function useDomainDetection() {
  const [isDomainBoda, setIsDomainBoda] = useState(false);
  const [domainIdentifier, setDomainIdentifier] = useState(null);

  useEffect(() => {
    // Dominios base de la plataforma (no son bodas personalizadas)
    const baseDomains = [
      "localhost",
      "127.0.0.1",
      "miwebdebodas.com",
      "miwebdebodas.test",
      "161.97.169.31", // IP del servidor
    ];

    const currentHost = window.location.hostname;
    
    // Si el host no está en los dominios base, es un dominio personalizado
    const isCustomDomain = !baseDomains.some(base => currentHost.includes(base));

    if (isCustomDomain) {
      // El identificador es el dominio completo (con www o sin)
      setIsDomainBoda(true);
      setDomainIdentifier(currentHost);
    } else {
      setIsDomainBoda(false);
      setDomainIdentifier(null);
    }
  }, []);

  return { isDomainBoda, domainIdentifier };
}
