import { useState, useEffect } from 'react';
import { FiMonitor, FiUser, FiMapPin, FiClock, FiRefreshCw } from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';
import axiosClient from '../../../shared/config/axiosClient';

const SesionesActivasPage = () => {
  const [sesiones, setSesiones] = useState([]);
  const [totalSesiones, setTotalSesiones] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    cargarSesiones();
    // Auto-actualizar cada 30 segundos
    const interval = setInterval(cargarSesiones, 30000);
    return () => clearInterval(interval);
  }, []);

  const cargarSesiones = async () => {
    try {
      setActualizando(true);
      const response = await axiosClient.get('/superadmin/sesiones-activas');
      setSesiones(response.data.sesiones);
      setTotalSesiones(response.data.total_sesiones);
    } catch (error) {
      console.error('Error cargando sesiones:', error);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  const obtenerTiempoRelativo = (fecha) => {
    const ahora = new Date();
    const fechaSesion = new Date(fecha);
    const diferencia = Math.floor((ahora - fechaSesion) / 1000); // segundos

    if (diferencia < 60) return 'Hace menos de 1 minuto';
    if (diferencia < 3600) return `Hace ${Math.floor(diferencia / 60)} minutos`;
    if (diferencia < 86400) return `Hace ${Math.floor(diferencia / 3600)} horas`;
    return `Hace ${Math.floor(diferencia / 86400)} días`;
  };

  const obtenerNavegador = (userAgent) => {
    if (!userAgent) return 'Desconocido';
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Otro';
  };

  const obtenerDispositivo = (userAgent) => {
    if (!userAgent) return 'Desconocido';
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return 'Móvil';
    }
    if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
      return 'Tablet';
    }
    return 'Escritorio';
  };

  return (
    <div className="space-y-5 text-[14px]">
      {/* Encabezado Premium */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
            <FiMonitor className="text-blue-600" size={26} />
            Sesiones Activas
          </h1>
          <p className="text-slate-600 text-[13px]">Usuarios conectados actualmente en la plataforma</p>
        </div>
        <button
          onClick={cargarSesiones}
          disabled={actualizando}
          className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
        >
          <FiRefreshCw size={16} className={actualizando ? 'animate-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* Tarjeta de resumen Premium */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white bg-opacity-20 rounded-xl">
            <FiMonitor size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-bold">{totalSesiones}</h2>
            <p className="text-blue-100 text-sm">Sesiones activas en este momento</p>
          </div>
        </div>
      </div>

      {/* Lista de sesiones Premium */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        {cargando ? (
          <div className="flex flex-col justify-center items-center h-64">
            <ImSpinner2 className="animate-spin text-slate-600 mb-4" size={48} />
            <p className="text-slate-600">Cargando sesiones...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 text-xs uppercase">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Usuario</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Dispositivo</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Navegador</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">IP</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Última Actividad</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700">Tiempo Conectado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sesiones.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No hay sesiones activas
                    </td>
                  </tr>
                ) : (
                  sesiones.map((sesion) => (
                    <tr key={sesion.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center">
                            <FiUser className="text-slate-600" size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-800">
                              {sesion.usuario?.name || 'Usuario desconocido'}
                            </p>
                            <p className="text-xs text-slate-500">{sesion.usuario?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <FiMonitor size={16} className="text-slate-400" />
                          <span>{obtenerDispositivo(sesion.user_agent)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {obtenerNavegador(sesion.user_agent)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <FiMapPin size={14} className="text-slate-400" />
                          <span className="text-sm font-mono text-slate-600">
                            {sesion.ip_address || '-'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <FiClock size={14} className="text-slate-400" />
                          <span>{obtenerTiempoRelativo(sesion.ultima_actividad)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {new Date(sesion.created_at).toLocaleString('es-ES')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Nota informativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <FiClock className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Actualización automática</p>
            <p>Esta página se actualiza automáticamente cada 30 segundos para mostrar las sesiones más recientes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SesionesActivasPage;
