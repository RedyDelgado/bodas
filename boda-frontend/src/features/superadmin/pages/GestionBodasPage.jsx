import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiEdit, FiTrash2, FiUserCheck, FiHeart } from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';
import axiosClient from '../../../shared/config/axiosClient';

const GestionBodasPage = () => {
  const navigate = useNavigate();
  const [bodas, setBodas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  
  useEffect(() => {
    cargarBodas();
  }, [paginaActual, buscar]);

  const cargarBodas = async () => {
    try {
      setCargando(true);
      const params = new URLSearchParams({
        page: paginaActual,
        ...(buscar && { buscar }),
      });
      
      const response = await axiosClient.get(`/bodas?${params}`);
      setBodas(response.data.data);
      setTotalPaginas(response.data.last_page);
    } catch (error) {
      console.error('Error cargando bodas:', error);
    } finally {
      setCargando(false);
    }
  };

  const impersonarUsuario = async (usuarioId, usuarioNombre, bodaId) => {
    if (!confirm(`¿Entrar como ${usuarioNombre}?\n\nPodrás ver y editar todo como si fueras este usuario.`)) {
      return;
    }
    
    try {
      const response = await axiosClient.post(`/superadmin/usuarios/${usuarioId}/impersonate`);
      
      // Guardar token actual para poder volver
      const tokenActual = localStorage.getItem('token');
      sessionStorage.setItem('superadmin_token_backup', tokenActual);
      sessionStorage.setItem('impersonating_user', usuarioNombre);
      sessionStorage.setItem('impersonating_user_id', usuarioId);
      
      // Usar el nuevo token
      localStorage.setItem('token', response.data.token);
      
      // Recargar la aplicación para refrescar contexto de usuario
      // Redirigir directamente al dashboard operativo de la boda seleccionada
      window.location.href = `/panel?boda=${bodaId}`;
    } catch (error) {
      console.error('Error impersonando usuario:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Error desconocido';
      alert(`Error al impersonar usuario:\n${errorMsg}\n\nAsegúrate de tener permisos de superadmin.`);
    }
  };

  const verBoda = (bodaSlug) => {
    // Abrir en nueva pestaña la vista pública de la boda por slug
    const url = `${window.location.origin}/p/${bodaSlug}`;
    window.open(url, '_blank');
  };

  const editarBodaDirectamente = (bodaId, usuarioId) => {
    // Navegar directamente a editar (superadmin tiene permisos)
    navigate(`/admin/bodas/${bodaId}/editar`);
  };

  const obtenerEstadoBadge = (estado) => {
    const estados = {
      activa: 'bg-green-100 text-green-700',
      inactiva: 'bg-slate-100 text-slate-700',
      suspendida: 'bg-red-100 text-red-700',
    };
    return estados[estado] || 'bg-slate-100 text-slate-700';
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-5 text-[14px]">
      {/* Encabezado Premium */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
          <FiHeart className="text-rose-600" size={26} />
          Gestión de Bodas
        </h1>
        <p className="text-slate-600 text-[13px]">Administra y visualiza todas las bodas de la plataforma</p>
      </div>

      {/* Barra de búsqueda Premium */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={buscar}
              onChange={(e) => {
                setBuscar(e.target.value);
                setPaginaActual(1);
              }}
              placeholder="Buscar bodas..."
              className="w-full pl-12 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tabla de bodas Premium */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        {cargando ? (
          <div className="flex flex-col justify-center items-center h-64">
            <ImSpinner2 className="animate-spin text-slate-600 mb-4" size={48} />
            <p className="text-slate-600">Cargando bodas...</p>
          </div>
        ) : bodas.length === 0 ? (
          <div className="text-center py-16">
            <FiHeart className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-slate-600 font-medium">No se encontraron bodas</p>
            <p className="text-sm text-slate-500">Intenta con otros términos de búsqueda</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-xs uppercase">
                  <tr>
                    <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">Pareja</th>
                    <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">Usuario</th>
                    <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">Fecha</th>
                    <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">Dominio</th>
                    <th className="text-center py-3 px-5 font-bold text-slate-700 tracking-wider">Plan</th>
                    <th className="text-center py-3 px-5 font-bold text-slate-700 tracking-wider">Estado</th>
                    <th className="text-center py-3 px-5 font-bold text-slate-700 tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bodas.map((boda) => (
                    <tr key={boda.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-2">
                          <FiHeart className="text-rose-400" size={16} />
                          <span className="font-semibold text-slate-900">{boda.titulo}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5">
                        <div className="font-medium text-slate-800">
                          {boda.nombre_novia} & {boda.nombre_novio}
                        </div>
                        <div className="text-xs text-slate-500">{boda.ciudad || '-'}</div>
                      </td>
                      <td className="py-3 px-5">
                        <div className="text-sm font-medium text-slate-800">{boda.usuario?.name}</div>
                        <div className="text-xs text-slate-500">{boda.usuario?.email}</div>
                      </td>
                      <td className="py-3 px-5 text-sm text-slate-600">
                        {formatearFecha(boda.fecha_boda || boda.fecha_evento)}
                      </td>
                      <td className="py-3 px-5">
                        <div className="text-sm text-slate-800 font-mono">{boda.slug}</div>
                        {boda.dominio_personalizado && (
                          <div className="text-xs text-blue-600 font-medium">{boda.dominio_personalizado}</div>
                        )}
                      </td>
                      <td className="py-3 px-5 text-center">
                        <span className="inline-flex px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700">
                          {boda.plan?.nombre || '-'}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold ${
                            boda.estado === 'activa'
                              ? 'bg-emerald-100 text-emerald-800'
                              : boda.estado === 'inactiva'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          <span
                            className={`inline-block w-1.5 h-1.5 rounded-full ${
                              boda.estado === 'activa'
                                ? 'bg-emerald-600'
                                : boda.estado === 'inactiva'
                                ? 'bg-slate-600'
                                : 'bg-rose-600'
                            }`}
                          ></span>
                          {boda.estado.charAt(0).toUpperCase() + boda.estado.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => verBoda(boda.slug)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver boda pública"
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => editarBodaDirectamente(boda.id, boda.usuario?.id)}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Editar boda"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => impersonarUsuario(boda.usuario?.id, boda.usuario?.name, boda.id)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Entrar como usuario"
                          >
                            <FiUserCheck size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación Premium */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-3 py-3.5 px-5 border-t border-slate-200 bg-slate-50 text-sm">
                <button
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="px-3 py-1.5 font-medium border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="font-medium text-slate-600">
                  {paginaActual} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="px-3 py-1.5 font-medium border border-slate-300 rounded-lg hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GestionBodasPage;
