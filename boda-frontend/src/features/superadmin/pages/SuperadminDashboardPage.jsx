import { useState, useEffect, useMemo } from 'react';
import {
  FiUsers,
  FiHeart,
  FiActivity,
  FiTrendingUp,
  FiArrowUpRight,
  FiArrowDownRight,
  FiTarget,
  FiBarChart2,
} from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';
import axiosClient from '../../../shared/config/axiosClient';

const SuperadminDashboardPage = () => {
  const [metricas, setMetricas] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [rangoFechas, setRangoFechas] = useState(30);

  useEffect(() => {
    cargarMetricas();
  }, [rangoFechas]);

  const cargarMetricas = async () => {
    try {
      setCargando(true);
      const response = await axiosClient.get(`/superadmin/metricas?rango=${rangoFechas}`);
      setMetricas(response.data);
    } catch (error) {
      console.error('Error cargando métricas:', error);
    } finally {
      setCargando(false);
    }
  };

  // Datos seguros para evitar cortar hooks por retornos tempranos
  const resumenSeguro = metricas?.resumen || {
    total_usuarios: 0,
    usuarios_activos: 0,
    total_bodas: 0,
    bodas_activas: 0,
    tasa_activacion: 0,
  };
  const usuarios_por_mes = metricas?.usuarios_por_mes || [];
  const bodas_por_mes = metricas?.bodas_por_mes || [];
  const top_usuarios = metricas?.top_usuarios || [];

  // Deltas simples contra el mes anterior (si hay datos) para mostrar tendencia
  const { deltaUsuarios, deltaBodas } = useMemo(() => {
    const delta = (serie = []) => {
      if (!serie.length) return null;
      const [actual, anterior] = serie;
      if (!anterior || !anterior.total) return null;
      return Math.round(((actual.total - anterior.total) / anterior.total) * 100);
    };
    return {
      deltaUsuarios: delta(usuarios_por_mes),
      deltaBodas: delta(bodas_por_mes),
    };
  }, [usuarios_por_mes, bodas_por_mes]);

  if (cargando) {
    return (
      <div className="flex justify-center items-center h-64">
        <ImSpinner2 className="animate-spin text-slate-700" size={40} />
      </div>
    );
  }

  if (!metricas) {
    return <div>Error cargando métricas</div>;
  }

  const resumen = resumenSeguro;

  const renderDelta = (valor) => {
    if (valor === null || Number.isNaN(valor)) return null;
    const positivo = valor >= 0;
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-semibold ${positivo ? 'text-emerald-600' : 'text-rose-600'}`}>
        {positivo ? <FiArrowUpRight size={14} /> : <FiArrowDownRight size={14} />}
        {Math.abs(valor)}%
      </span>
    );
  };

  return (
    <div className="space-y-5 text-[14px]">
      {/* Encabezado Premium */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
          <FiBarChart2 className="text-slate-600" size={26} />
          Dashboard Analítico
        </h1>
        <p className="text-slate-600 text-[13px]">Métricas clave y tendencias de la plataforma</p>
      </div>

      {/* Selector de rango Premium */}
      <div className="flex justify-end">
        <select
          value={rangoFechas}
          onChange={(e) => setRangoFechas(Number(e.target.value))}
          className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent font-medium text-sm"
        >
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
          <option value={365}>Último año</option>
        </select>
      </div>

      {/* Tarjetas de métricas principales Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Usuarios */}
        <div className="bg-white rounded-xl shadow-lg p-5 border border-slate-200 border-l-4 border-l-sky-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <FiUsers className="text-sky-600" size={20} />
            </div>
            {renderDelta(deltaUsuarios)}
          </div>
          <p className="text-slate-600 text-sm mb-1 font-medium">Total usuarios</p>
          <p className="text-2xl font-bold text-slate-900">{resumen.total_usuarios}</p>
          <p className="text-xs text-slate-500 mt-1">{resumen.usuarios_activos} activos en 7 días</p>
        </div>

        {/* Bodas */}
        <div className="bg-white rounded-xl shadow-lg p-5 border border-slate-200 border-l-4 border-l-rose-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <FiHeart className="text-rose-600" size={20} />
            </div>
            {renderDelta(deltaBodas)}
          </div>
          <p className="text-slate-600 text-sm mb-1 font-medium">Bodas registradas</p>
          <p className="text-2xl font-bold text-slate-900">{resumen.total_bodas}</p>
          <p className="text-xs text-slate-500 mt-1">{resumen.bodas_activas} activas ahora</p>
        </div>

        {/* Activación */}
        <div className="bg-white rounded-xl shadow-lg p-5 border border-slate-200 border-l-4 border-l-emerald-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <FiActivity className="text-emerald-600" size={20} />
            </div>
            <Badge neutral label="Meta 60%" icon={<FiTarget size={12} />} />
          </div>
          <p className="text-slate-600 text-sm mb-1 font-medium">Tasa de activación</p>
          <p className="text-2xl font-bold text-slate-900">{resumen.tasa_activacion}%</p>
          <p className="text-xs text-slate-500 mt-1">Usuarios activos vs total</p>
        </div>

        {/* Evolución */}
        <div className="bg-white rounded-xl shadow-lg p-5 border border-slate-200 border-l-4 border-l-indigo-500 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="text-indigo-600" size={20} />
            </div>
          </div>
          <p className="text-slate-600 text-sm mb-1 font-medium">Evolución</p>
          <p className="text-2xl font-bold text-slate-900">Próx.</p>
          <p className="text-xs text-slate-500 mt-2">Embudo y facturación</p>
        </div>
      </div>

      {/* Gráficos y listados Premium */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Usuarios por mes */}
        <div className="bg-white rounded-xl shadow-lg p-5 border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-sky-500 rounded-full"></span>
            Usuarios registrados por mes
          </h3>
          <div className="space-y-4">
            {usuarios_por_mes.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{item.mes}</span>
                <div className="flex items-center gap-3 flex-1 ml-3">
                  <div className="w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-sky-400 to-sky-600 transition-all"
                      style={{ width: `${(item.total / Math.max(...usuarios_por_mes.map(s => s.total))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 w-8 text-right">{item.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bodas por mes */}
        <div className="bg-white rounded-xl shadow-lg p-5 border border-slate-200">
          <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-rose-500 rounded-full"></span>
            Bodas creadas por mes
          </h3>
          <div className="space-y-4">
            {bodas_por_mes.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{item.mes}</span>
                <div className="flex items-center gap-3 flex-1 ml-3">
                  <div className="w-28 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all"
                      style={{ width: `${(item.total / Math.max(...bodas_por_mes.map(s => s.total))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 w-8 text-right">{item.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen rápido */}
        <div className="bg-white rounded-xl shadow-lg p-5 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-800">Resumen rápido</h3>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Últimos {rangoFechas}d</span>
          </div>
          <ul className="space-y-0">
            <li className="flex justify-between items-center py-2.5 border-b border-slate-200">
              <span className="text-slate-700 font-medium">Total usuarios</span>
              <strong className="text-slate-900 text-base">{resumen.total_usuarios}</strong>
            </li>
            <li className="flex justify-between items-center py-2.5 border-b border-slate-200">
              <span className="text-slate-700 font-medium">Usuarios activos (7d)</span>
              <strong className="text-slate-900 text-base">{resumen.usuarios_activos}</strong>
            </li>
            <li className="flex justify-between items-center py-2.5 border-b border-slate-200">
              <span className="text-slate-700 font-medium">Bodas activas</span>
              <strong className="text-slate-900 text-base">{resumen.bodas_activas}</strong>
            </li>
            <li className="flex justify-between items-center py-2.5">
              <span className="text-slate-700 font-medium">Tasa activación</span>
              <strong className="text-emerald-600 text-base">{resumen.tasa_activacion}%</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* Top usuarios Premium */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-3.5 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-800 uppercase tracking-wider">Top 10 usuarios con más bodas</h3>
            <span className="text-[11px] font-semibold text-slate-600 uppercase">Ordenado por bodas</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 text-xs uppercase">
                <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">#</th>
                <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">Usuario</th>
                <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">Email</th>
                <th className="text-right py-3 px-5 font-bold text-slate-700 tracking-wider">Bodas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {top_usuarios.map((usuario, idx) => (
                <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-5 text-slate-900 font-semibold">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-200 rounded-full text-[11px] font-bold">
                      {idx + 1}
                    </span>
                  </td>
                  <td className="py-3 px-5 text-slate-900 font-semibold">{usuario.name}</td>
                  <td className="py-3 px-5 text-slate-600">{usuario.email}</td>
                  <td className="py-3 px-5 text-right">
                    <span className="inline-flex items-center justify-center w-7 h-7 bg-emerald-100 text-emerald-700 rounded-full font-bold text-xs">
                      {usuario.bodas_count}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Badge component mejorado
const Badge = ({ success, neutral, label, icon }) => (
  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold ${
    success ? 'bg-emerald-100 text-emerald-700' :
    neutral ? 'bg-slate-100 text-slate-700' :
    'bg-slate-100 text-slate-700'
  }`}>
    {icon}
    {label}
  </span>
);

export default SuperadminDashboardPage;
