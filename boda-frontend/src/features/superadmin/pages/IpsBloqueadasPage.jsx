import { useState, useEffect } from 'react';
import { FiShield, FiX, FiCheck, FiClock, FiAlertTriangle } from 'react-icons/fi';
import axiosClient from '../../../shared/config/axiosClient';

const IpsBloqueadasPage = () => {
  const [ipsBloqueadas, setIpsBloqueadas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [ipNueva, setIpNueva] = useState('');
  const [razonBloqueo, setRazonBloqueo] = useState('');
  const [duracionHoras, setDuracionHoras] = useState('');

  useEffect(() => {
    cargarIpsBloqueadas();
  }, []);

  const cargarIpsBloqueadas = async () => {
    try {
      setCargando(true);
      const response = await axiosClient.get('/superadmin/ips-bloqueadas');
      setIpsBloqueadas(response.data.ips_bloqueadas);
    } catch (error) {
      console.error('Error cargando IPs bloqueadas:', error);
    } finally {
      setCargando(false);
    }
  };

  const bloquearIp = async (e) => {
    e.preventDefault();
    try {
      await axiosClient.post('/superadmin/ips-bloqueadas', {
        ip_address: ipNueva,
        razon: razonBloqueo,
        duracion_horas: duracionHoras || null,
      });
      cerrarModal();
      cargarIpsBloqueadas();
    } catch (error) {
      console.error('Error bloqueando IP:', error);
      alert('Error al bloquear IP');
    }
  };

  const desbloquearIp = async (ip) => {
    if (!confirm(`¿Desbloquear la IP ${ip.ip_address}?`)) return;
    
    try {
      await axiosClient.delete(`/superadmin/ips-bloqueadas/${ip.id}`);
      cargarIpsBloqueadas();
    } catch (error) {
      console.error('Error desbloqueando IP:', error);
      alert('Error al desbloquear IP');
    }
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setIpNueva('');
    setRazonBloqueo('');
    setDuracionHoras('');
  };

  const estaActivo = (ip) => {
    if (!ip.activo) return false;
    if (!ip.bloqueado_hasta) return true;
    return new Date(ip.bloqueado_hasta) > new Date();
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">IPs Bloqueadas</h1>
          <p className="text-slate-600">Control de direcciones IP bloqueadas en la plataforma</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <FiShield size={18} />
          <span>Bloquear IP</span>
        </button>
      </div>

      {/* Lista de IPs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {cargando ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">IP</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Razón</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Bloqueado por</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Intentos</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Expira</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Estado</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ipsBloqueadas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      No hay IPs bloqueadas
                    </td>
                  </tr>
                ) : (
                  ipsBloqueadas.map((ip) => (
                    <tr key={ip.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm font-mono font-bold text-slate-800">
                        {ip.ip_address}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600 max-w-xs truncate">
                        {ip.razon}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {ip.bloqueado_por ? ip.bloqueado_por.name : 'Sistema'}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                          {ip.intentos_fallidos}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {ip.bloqueado_hasta ? (
                          <div className="flex items-center gap-1">
                            <FiClock size={14} />
                            <span>{new Date(ip.bloqueado_hasta).toLocaleString('es-ES')}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400">Permanente</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {estaActivo(ip) ? (
                          <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                            <FiAlertTriangle size={16} />
                            <span>Bloqueada</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                            <FiCheck size={16} />
                            <span>Expirada</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {estaActivo(ip) && (
                          <button
                            onClick={() => desbloquearIp(ip)}
                            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                          >
                            Desbloquear
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal para bloquear IP */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Bloquear IP</h3>
              <button
                onClick={cerrarModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={bloquearIp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Dirección IP
                </label>
                <input
                  type="text"
                  value={ipNueva}
                  onChange={(e) => setIpNueva(e.target.value)}
                  required
                  pattern="^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$"
                  placeholder="192.168.1.1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Razón del bloqueo
                </label>
                <textarea
                  value={razonBloqueo}
                  onChange={(e) => setRazonBloqueo(e.target.value)}
                  required
                  rows={3}
                  placeholder="Explica por qué se bloquea esta IP..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duración (horas)
                </label>
                <input
                  type="number"
                  value={duracionHoras}
                  onChange={(e) => setDuracionHoras(e.target.value)}
                  min="1"
                  placeholder="Dejar vacío para bloqueo permanente"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Si no especificas duración, el bloqueo será permanente
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Bloquear IP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IpsBloqueadasPage;
