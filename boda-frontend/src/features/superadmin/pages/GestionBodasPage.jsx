import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEye, FiEdit, FiTrash2, FiUserCheck } from 'react-icons/fi';
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
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestión de Bodas</h1>
        <p className="text-slate-600">Administra y visualiza todas las bodas de la plataforma</p>
      </div>

      {/* Barra de búsqueda */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              value={buscar}
              onChange={(e) => {
                setBuscar(e.target.value);
                setPaginaActual(1);
              }}
              placeholder="Buscar por nombres, subdominio o dominio..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla de bodas */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {cargando ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
          </div>
        ) : bodas.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-500">No se encontraron bodas</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Pareja</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Fecha Evento</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Slug/Dominio</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bodas.map((boda) => (
                    <tr key={boda.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-600 font-mono">
                        #{boda.id}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-800">
                          {boda.nombre_novia} & {boda.nombre_novio}
                        </div>
                        <div className="text-xs text-slate-500">{boda.ciudad || '-'}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-slate-800">{boda.usuario?.name}</div>
                        <div className="text-xs text-slate-500">{boda.usuario?.email}</div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {formatearFecha(boda.fecha_boda || boda.fecha_evento)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-slate-800 font-mono">{boda.slug}</div>
                        {boda.dominio_personalizado && (
                          <div className="text-xs text-blue-600">{boda.dominio_personalizado}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {boda.plan?.nombre || '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${obtenerEstadoBadge(boda.estado)}`}>
                          {boda.estado}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => verBoda(boda.slug)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver boda pública"
                          >
                            <FiEye size={18} />
                          </button>
                          <button
                            onClick={() => editarBodaDirectamente(boda.id, boda.usuario?.id)}
                            className="p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                            title="Editar boda (como superadmin)"
                          >
                            <FiEdit size={18} />
                          </button>
                          <button
                            onClick={() => impersonarUsuario(boda.usuario?.id, boda.usuario?.name, boda.id)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Entrar como este usuario"
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

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="flex justify-center items-center gap-4 py-4 px-6 border-t border-slate-200">
                <button
                  onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
                  disabled={paginaActual === 1}
                  className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="text-sm text-slate-600">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
                  disabled={paginaActual === totalPaginas}
                  className="px-4 py-2 text-sm border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
