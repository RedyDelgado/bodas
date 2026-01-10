import { useState, useEffect } from 'react';
import { FiShield, FiX, FiCheck, FiClock, FiAlertTriangle, FiPlus } from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';
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
    <div className="space-y-5 text-[14px]">
      {/* Encabezado Premium */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
            <FiShield className="text-red-600" size={26} />
            IPs Bloqueadas
          </h1>
          <p className="text-slate-600 text-[13px]">Control de direcciones IP bloqueadas en la plataforma</p>
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="flex items-center gap-2 px-3.5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
        >
          <FiPlus size={16} />
          <span>Bloquear IP</span>
        </button>
      </div>

      {/* Lista de IPs Premium */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
        {cargando ? (
          <div className="flex flex-col justify-center items-center h-64">
            <ImSpinner2 className="animate-spin text-slate-600 mb-4" size={48} />
            <p className="text-slate-600">Cargando IPs bloqueadas...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 text-xs uppercase">
                <tr>
                  <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">IP</th>
                  <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">Razón</th>
                  <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">Por</th>
                  <th className="text-center py-3 px-5 font-bold text-slate-700 tracking-wider">Intentos</th>
                  <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">Expira</th>
                  <th className="text-center py-3 px-5 font-bold text-slate-700 tracking-wider">Estado</th>
                  <th className="text-center py-3 px-5 font-bold text-slate-700 tracking-wider">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ipsBloqueadas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center">
                      <FiShield className="mx-auto text-slate-300 mb-2" size={48} />
                      <p className="text-slate-600 font-medium">No hay IPs bloqueadas</p>
                      <p className="text-sm text-slate-500">El sistema está seguro</p>
                    </td>
                  </tr>
                ) : (
                  ipsBloqueadas.map((ip) => (
                    <tr key={ip.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5 text-sm font-mono font-bold text-slate-800">
                        {ip.ip_address}
                      </td>
                      <td className="py-3 px-5 text-sm text-slate-600 max-w-xs">
                        {ip.razon}
                      </td>
                      <td className="py-3 px-5 text-sm text-slate-600">
                        {ip.bloqueado_por ? ip.bloqueado_por.name : 'Sistema'}
                      </td>
                      <td className="py-3 px-5 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                          {ip.intentos_fallidos}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-sm text-slate-600">
                        {ip.bloqueado_hasta ? (
                          <div className="flex items-center gap-1 text-slate-600">
                            <FiClock size={14} className="text-amber-600" />
                            <span>{new Date(ip.bloqueado_hasta).toLocaleDateString('es-ES')}</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-medium">Permanente</span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-center">
                        {estaActivo(ip) ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                            Bloqueada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                            <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                            Expirada
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5 text-center">
                        {estaActivo(ip) && (
                          <button
                            onClick={() => desbloquearIp(ip)}
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-800">Bloquear IP</h3>
              <button
                onClick={cerrarModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={bloquearIp} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
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
                <label className="block text-sm font-medium text-slate-700 mb-1">
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

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={cerrarModal}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
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
