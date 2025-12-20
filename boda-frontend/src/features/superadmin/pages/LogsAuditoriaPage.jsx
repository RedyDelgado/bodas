import { useState, useEffect } from 'react';
import { FiFilter, FiSearch, FiAlertCircle, FiInfo, FiShield } from 'react-icons/fi';
import axiosClient from '../../../shared/config/axiosClient';

const LogsAuditoriaPage = () => {
  const [logs, setLogs] = useState([]);
  const [accionesDisponibles, setAccionesDisponibles] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  
  // Filtros
  const [filtros, setFiltros] = useState({
    accion: '',
    nivel: '',
    usuario_id: '',
    fecha_desde: '',
    fecha_hasta: '',
  });

  useEffect(() => {
    cargarLogs();
    cargarUsuarios();
  }, [paginaActual, filtros]);

  const cargarUsuarios = async () => {
    try {
      const response = await axiosClient.get('/superadmin/usuarios');
      setUsuarios(response.data.usuarios.data || []);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  const cargarLogs = async () => {
    try {
      setCargando(true);
      const params = new URLSearchParams({
        page: paginaActual,
        ...Object.fromEntries(Object.entries(filtros).filter(([_, v]) => v !== '')),
      });
      
      const response = await axiosClient.get(`/superadmin/logs-auditoria?${params}`);
      setLogs(response.data.logs.data);
      setAccionesDisponibles(response.data.acciones_disponibles);
      setTotalPaginas(response.data.logs.last_page);
    } catch (error) {
      console.error('Error cargando logs:', error);
    } finally {
      setCargando(false);
    }
  };

  const aplicarFiltros = (e) => {
    e.preventDefault();
    setPaginaActual(1);
    cargarLogs();
  };

  const limpiarFiltros = () => {
    setFiltros({
      accion: '',
      nivel: '',
      usuario_id: '',
      fecha_desde: '',
      fecha_hasta: '',
    });
    setPaginaActual(1);
  };

  const obtenerIconoNivel = (nivel) => {
    switch (nivel) {
      case 'CRITICO':
        return <FiAlertCircle className="text-red-500" size={18} />;
      case 'MEDIO':
        return <FiShield className="text-yellow-500" size={18} />;
      case 'INFO':
        return <FiInfo className="text-blue-500" size={18} />;
      default:
        return <FiInfo className="text-slate-400" size={18} />;
    }
  };

  const obtenerColorNivel = (nivel) => {
    switch (nivel) {
      case 'CRITICO':
        return 'bg-red-100 text-red-700';
      case 'MEDIO':
        return 'bg-yellow-100 text-yellow-700';
      case 'INFO':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Logs de Auditoría</h1>
        <p className="text-slate-600">Registro de todas las acciones importantes en la plataforma</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-slate-600" size={20} />
          <h2 className="text-lg font-bold text-slate-800">Filtros</h2>
        </div>
        
        <form onSubmit={aplicarFiltros} className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Usuario</label>
            <select
              value={filtros.usuario_id}
              onChange={(e) => setFiltros({ ...filtros, usuario_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm"
            >
              <option value="">Todos los usuarios</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.name} ({usuario.email})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Acción</label>
            <select
              value={filtros.accion}
              onChange={(e) => setFiltros({ ...filtros, accion: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">Todas</option>
              {accionesDisponibles.map((accion) => (
                <option key={accion} value={accion}>
                  {accion}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Nivel</label>
            <select
              value={filtros.nivel}
              onChange={(e) => setFiltros({ ...filtros, nivel: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              <option value="">Todos</option>
              <option value="CRITICO">CRÍTICO</option>
              <option value="MEDIO">MEDIO</option>
              <option value="INFO">INFO</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha Desde</label>
            <input
              type="date"
              value={filtros.fecha_desde}
              onChange={(e) => setFiltros({ ...filtros, fecha_desde: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Fecha Hasta</label>
            <input
              type="date"
              value={filtros.fecha_hasta}
              onChange={(e) => setFiltros({ ...filtros, fecha_hasta: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Aplicar
            </button>
            <button
              type="button"
              onClick={limpiarFiltros}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Limpiar
            </button>
          </div>
        </form>
      </div>

      {/* Tabla de logs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {cargando ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Fecha</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Usuario</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Acción</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Nivel</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Descripción</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {new Date(log.created_at).toLocaleString('es-ES')}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-800">
                        {log.usuario ? log.usuario.name : 'Sistema'}
                        {log.usuario && (
                          <div className="text-xs text-slate-500">{log.usuario.email}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                          {log.accion}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {obtenerIconoNivel(log.nivel)}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${obtenerColorNivel(log.nivel)}`}>
                            {log.nivel}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 max-w-md truncate">
                        {log.descripcion || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 font-mono">
                        {log.ip_address || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPaginas > 1 && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                <div className="text-sm text-slate-600">
                  Página {paginaActual} de {totalPaginas}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LogsAuditoriaPage;
