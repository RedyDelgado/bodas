import { useState, useEffect, useMemo } from 'react';
import {
  FiUsers,
  FiHeart,
  FiActivity,
  FiTrendingUp,
  FiArrowUpRight,
  FiArrowDownRight,
  FiTarget,
} from 'react-icons/fi';
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
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
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Analítico</h1>
        <p className="text-slate-600">Métricas clave y tendencias de la plataforma</p>
      </div>

      {/* Selector de rango */}
      <div className="flex justify-end">
        <select
          value={rangoFechas}
          onChange={(e) => setRangoFechas(Number(e.target.value))}
          className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
          <option value={365}>Último año</option>
        </select>
      </div>

      {/* Tarjetas de métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <FiUsers className="text-sky-600" size={24} />
            {renderDelta(deltaUsuarios)}
          </div>
          <p className="text-slate-500 text-sm mb-1">Total usuarios</p>
          <p className="text-2xl font-bold text-slate-900">{resumen.total_usuarios}</p>
          <p className="text-xs text-slate-500 mt-1">{resumen.usuarios_activos} activos últimos 7d</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <FiHeart className="text-rose-600" size={24} />
            {renderDelta(deltaBodas)}
          </div>
          <p className="text-slate-500 text-sm mb-1">Bodas registradas</p>
          <p className="text-2xl font-bold text-slate-900">{resumen.total_bodas}</p>
          <p className="text-xs text-slate-500 mt-1">{resumen.bodas_activas} activas ahora</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-2">
            <FiActivity className="text-emerald-600" size={24} />
            <Badge neutral label="Meta 60%" icon={<FiTarget size={14} />} />
          </div>
          <p className="text-slate-500 text-sm mb-1">Tasa de activación</p>
          <p className="text-2xl font-bold text-slate-900">{resumen.tasa_activacion}%</p>
          <p className="text-xs text-slate-500 mt-1">Usuarios activos vs total</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <FiTrendingUp className="text-indigo-600 mb-2" size={24} />
          <p className="text-slate-500 text-sm mb-1">Evolución</p>
          <p className="text-2xl font-bold text-slate-900">Próximamente</p>
          <p className="text-xs text-slate-500 mt-1">Embudo y facturación</p>
        </div>
      </div>

      {/* Gráficos y listados */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Usuarios registrados por mes</h3>
          <div className="space-y-3">
            {usuarios_por_mes.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{item.mes}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all"
                      style={{ width: `${(item.total / Math.max(...usuarios_por_mes.map(s => s.total))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900 w-12 text-right">{item.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Bodas creadas por mes</h3>
          <div className="space-y-3">
            {bodas_por_mes.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{item.mes}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all"
                      style={{ width: `${(item.total / Math.max(...bodas_por_mes.map(s => s.total))) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-slate-900 w-12 text-right">{item.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-800">Resumen rápido</h3>
            <span className="text-xs text-slate-500">Últimos {rangoFechas} días</span>
          </div>
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Total usuarios</span>
              <strong className="text-slate-900">{resumen.total_usuarios}</strong>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Usuarios activos (7d)</span>
              <strong className="text-slate-900">{resumen.usuarios_activos}</strong>
            </li>
            <li className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600">Bodas activas</span>
              <strong className="text-slate-900">{resumen.bodas_activas}</strong>
            </li>
            <li className="flex justify-between items-center py-2">
              <span className="text-slate-600">Tasa de activación</span>
              <strong className="text-emerald-600">{resumen.tasa_activacion}%</strong>
            </li>
          </ul>
        </div>
      </div>

      {/* Top usuarios */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Top 10 usuarios con más bodas</h3>
            <span className="text-xs text-slate-500">Ordenado por bodas</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="text-left py-3 px-6 font-medium text-slate-600">#</th>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Usuario</th>
                <th className="text-left py-3 px-6 font-medium text-slate-600">Email</th>
                <th className="text-right py-3 px-6 font-medium text-slate-600">Bodas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top_usuarios.map((usuario, idx) => (
                <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-6 text-slate-900">{idx + 1}</td>
                  <td className="py-3 px-6 text-slate-900 font-medium">{usuario.name}</td>
                  <td className="py-3 px-6 text-slate-600">{usuario.email}</td>
                  <td className="py-3 px-6 text-right font-medium text-slate-900">{usuario.bodas_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Badge component simplificado
const Badge = ({ success, neutral, label, icon }) => (
  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
    success ? 'bg-emerald-100 text-emerald-700' :
    neutral ? 'bg-slate-100 text-slate-600' :
    'bg-slate-100 text-slate-600'
  }`}>
    {icon}
    {label}
  </span>
);

export default SuperadminDashboardPage;
