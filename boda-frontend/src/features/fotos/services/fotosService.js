// src/features/fotos/services/fotosService.js
import { USE_FAKE_API } from "../../../shared/config/apiMode";
import {
  getFotosByBodaApi,
  uploadFotoApi,
  updateFotoApi,
  deleteFotoApi,
  marcarComoPortadaApi,
} from "./fotosApiService";

// Si en algún momento quieres datos fake, los implementas aquí:
const getFotosFake = async () => [];
const uploadFotoFake = async (_, file, meta) => ({
  id: Date.now(),
  bodaId: 0,
  urlImagen: URL.createObjectURL(file),
  titulo: meta.titulo ?? "Foto demo",
  descripcion: meta.descripcion ?? "",
  orden: 0,
  esPortada: false,
  esGaleriaPrivada: false,
});

const updateFotoFake = async (id, datos) => ({ id, ...datos });
const deleteFotoFake = async () => true;
const marcarComoPortadaFake = async (id) => ({ id, esPortada: true });

export function obtenerFotosBoda(bodaId) {
  if (!bodaId) return Promise.resolve([]);
  if (USE_FAKE_API) return getFotosFake(bodaId);
  return getFotosByBodaApi(bodaId);
}

export function subirFotoBoda(bodaId, file, meta) {
  if (USE_FAKE_API) return uploadFotoFake(bodaId, file, meta);
  return uploadFotoApi(bodaId, file, meta);
}

export function actualizarFoto(id, datos) {
  if (USE_FAKE_API) return updateFotoFake(id, datos);
  return updateFotoApi(id, datos);
}

export function eliminarFoto(id) {
  if (USE_FAKE_API) return deleteFotoFake(id);
  return deleteFotoApi(id);
}

export function marcarFotoComoPortada(id) {
  if (USE_FAKE_API) return marcarComoPortadaFake(id);
  return marcarComoPortadaApi(id);
}
