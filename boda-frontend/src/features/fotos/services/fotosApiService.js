// src/features/fotos/services/fotosApiService.js
import axiosClient from "../../../shared/config/axiosClient";

/**
 * Adaptador: fotos_boda (snake_case) → modelo frontend (camelCase).
 *
 * Campos típicos:
 * - id
 * - boda_id
 * - url_imagen
 * - titulo
 * - descripcion
 * - orden
 * - es_portada
 * - es_galeria_privada
 */
function mapFotoFromApi(f) {
  if (!f) return null;

  return {
    id: f.id,
    bodaId: f.boda_id,
    urlImagen: f.url_imagen,
    titulo: f.titulo ?? "",
    descripcion: f.descripcion ?? "",
    orden: f.orden ?? 0,
    esPortada: Boolean(f.es_portada),
    esGaleriaPrivada: Boolean(f.es_galeria_privada),
  };
}

/**
 * GET /mis-bodas/{boda}/fotos
 */
export async function getFotosByBodaApi(bodaId) {
  const response = await axiosClient.get(`/mis-bodas/${bodaId}/fotos`);
  const raw = response.data.data || response.data;
  const lista = Array.isArray(raw) ? raw : [];
  return lista.map(mapFotoFromApi);
}

/**
 * POST /mis-bodas/{boda}/fotos
 *
 * IMPORTANTE:
 * - Ajusta el nombre del campo de archivo según tu backend.
 *   Aquí uso 'archivo' (puede ser 'foto' o 'imagen' en tu controlador).
 */
export async function uploadFotoApi(bodaId, file, meta = {}) {
  const formData = new FormData();
  formData.append("archivo", file); // <-- CAMBIAR si tu API espera otro nombre

  if (meta.titulo) formData.append("titulo", meta.titulo);
  if (meta.descripcion) formData.append("descripcion", meta.descripcion);

  const response = await axiosClient.post(
    `/mis-bodas/${bodaId}/fotos`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  const raw = response.data.data || response.data;
  return mapFotoFromApi(raw);
}

/**
 * PUT /fotos-boda/{foto}
 */
export async function updateFotoApi(id, datos) {
  const payload = {
    titulo: datos.titulo,
    descripcion: datos.descripcion,
    orden: datos.orden,
    es_portada: datos.esPortada,
    es_galeria_privada: datos.esGaleriaPrivada,
  };

  const response = await axiosClient.put(`/fotos-boda/${id}`, payload);
  const raw = response.data.data || response.data;
  return mapFotoFromApi(raw);
}

/**
 * DELETE /fotos-boda/{foto}
 */
export async function deleteFotoApi(id) {
  await axiosClient.delete(`/fotos-boda/${id}`);
  return true;
}

/**
 * Marcar como portada (helper).
 * Depende de cómo implementes el controlador, aquí simplemente
 * hacemos un PUT con es_portada = true.
 */
export async function marcarComoPortadaApi(id) {
  const response = await axiosClient.put(`/fotos-boda/${id}`, {
    es_portada: true,
  });
  const raw = response.data.data || response.data;
  return mapFotoFromApi(raw);
}
