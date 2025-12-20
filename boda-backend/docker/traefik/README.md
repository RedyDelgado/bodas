Traefik para multi-dominio

- Traefik expone 80/443 y enruta por Host y PathPrefix.
- Certificados Let's Encrypt automáticos con HTTP-01 challenge.
- Usa labels en los servicios `frontend` y `app`.

Variables:
- `TRAEFIK_ACME_EMAIL`: correo para Let's Encrypt (configura en entorno/compose).

Directorios:
- `letsencrypt/acme.json` se crea automáticamente en el volumen al emitir el primer certificado.
