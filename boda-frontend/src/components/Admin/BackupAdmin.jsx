import React, { useState, useEffect } from 'react';
import axiosClient from '../../shared/config/axiosClient';
import {
  FiDatabase,
  FiImage,
  FiCreditCard,
  FiHardDrive,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiPlay,
  FiRefreshCw,
  FiSettings,
  FiBarChart2,
  FiCalendar,
  FiSave,
  FiInfo,
  FiArrowRight,
  FiCloud,
  FiShield,
} from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';

const BackupAdmin = () => {
  const [settings, setSettings] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [driveUsage, setDriveUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('config');
  const [backupRunning, setBackupRunning] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);
  const [notification, setNotification] = useState(null);

  const daysOfWeek = [
    { value: 'sun', label: 'Domingo', short: 'D' },
    { value: 'mon', label: 'Lunes', short: 'L' },
    { value: 'tue', label: 'Martes', short: 'M' },
    { value: 'wed', label: 'Miércoles', short: 'X' },
    { value: 'thu', label: 'Jueves', short: 'J' },
    { value: 'fri', label: 'Viernes', short: 'V' },
    { value: 'sat', label: 'Sábado', short: 'S' },
  ];

  const timesOfDay = Array.from({ length: 24 }, (_, i) =>
    `${String(i).padStart(2, '0')}:00`
  );

  // Mostrar notificación
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // Cargar datos iniciales
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [settingsRes, historyRes, statsRes, usageRes] = await Promise.all([
          axiosClient.get('/admin/backups/settings'),
          axiosClient.get('/admin/backups/history?limit=20'),
          axiosClient.get('/admin/backups/stats'),
          axiosClient.get('/admin/backups/drive-usage'),
        ]);

        setSettings(settingsRes.data.data);
        setHistory(historyRes.data.data);
        setStats(statsRes.data.data);
        setDriveUsage(usageRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Error al cargar datos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Guardar configuración
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const response = await axiosClient.put('/admin/backups/settings', settings);
      setSettings(response.data.data);
      showNotification('Configuración guardada exitosamente');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
      showNotification(err.response?.data?.message || 'Error al guardar', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Ejecutar backup ahora
  const handleRunBackupNow = async () => {
    try {
      setBackupRunning(true);
      await axiosClient.post('/admin/backups/run-now');
      showNotification('Backup iniciado en background. Revisa el historial en unos momentos.');
      setTimeout(() => fetchHistory(), 3000);
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error al ejecutar backup', 'error');
    } finally {
      setBackupRunning(false);
    }
  };

  // Verificar conexión Drive
  const handleVerifyDrive = async () => {
    if (!settings?.drive_remote) {
      showNotification('Ingresa una ruta de Drive válida', 'error');
      return;
    }

    try {
      setVerifying(true);
      const response = await axiosClient.post('/admin/backups/verify-drive', {
        drive_remote: settings.drive_remote,
      });

      if (response.data.connected) {
        showNotification('✓ Conexión con Google Drive exitosa');
      } else {
        showNotification('✗ No se pudo conectar. Revisa tu configuración de rclone.', 'error');
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Error al verificar conexión', 'error');
    } finally {
      setVerifying(false);
    }
  };

  // Recargar historial
  const fetchHistory = async () => {
    try {
      const response = await axiosClient.get('/admin/backups/history?limit=20');
      setHistory(response.data.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  // Toggle día de semana
  const toggleDay = (day) => {
    const newDays = settings.schedule_days.includes(day)
      ? settings.schedule_days.filter((d) => d !== day)
      : [...settings.schedule_days, day];
    setSettings({ ...settings, schedule_days: newDays });
  };

  // Toggle hora
  const toggleTime = (time) => {
    const newTimes = settings.schedule_times.includes(time)
      ? settings.schedule_times.filter((t) => t !== time)
      : [...settings.schedule_times, time];
    setSettings({ ...settings, schedule_times: newTimes });
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-PE');
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-96">
        <ImSpinner2 className="animate-spin text-slate-600 mb-4" size={48} />
        <p className="text-slate-600">Cargando configuración de backups...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-[14px]">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
            <FiShield className="text-emerald-600" size={26} />
            Administración de Backups
          </h1>
          <p className="text-slate-600 text-[13px]">
            Protege tu información con backups automáticos a Google Drive
          </p>
        </div>
        <button
          onClick={handleRunBackupNow}
          disabled={backupRunning}
          className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
        >
          {backupRunning ? (
            <>
              <ImSpinner2 className="animate-spin" size={16} />
              Ejecutando...
            </>
          ) : (
            <>
              <FiPlay size={16} />
              Ejecutar Backup
            </>
          )}
        </button>
      </div>

      {/* Notificación Toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in-down ${
            notification.type === 'error'
              ? 'bg-rose-600 text-white'
              : 'bg-emerald-600 text-white'
          }`}
        >
          {notification.type === 'error' ? (
            <FiAlertCircle size={20} />
          ) : (
            <FiCheckCircle size={20} />
          )}
          <span className="font-medium">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="ml-4 hover:bg-white/20 rounded p-1 transition-colors"
          >
            <FiX size={18} />
          </button>
        </div>
      )}

      {/* Error General */}
      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-700 px-6 py-4 rounded-lg flex items-start gap-3">
          <FiAlertCircle className="flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="font-semibold">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Tabs Premium */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
              activeTab === 'config'
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FiSettings size={18} />
            Configuración
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
              activeTab === 'history'
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FiClock size={18} />
            Historial
            {history.length > 0 && (
              <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full">
                {history.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex items-center gap-2 px-6 py-4 font-semibold transition-all ${
              activeTab === 'stats'
                ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FiBarChart2 size={18} />
            Estadísticas
          </button>
        </div>

      {/* TAB: Configuración */}
      {activeTab === 'config' && settings && (
        <div className="p-8">
          <form onSubmit={handleSaveSettings} className="space-y-8">
            {/* Habilitación de Backups */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-200">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-slate-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-600"></div>
                </div>
                <span className="ml-4 text-lg font-bold text-slate-800 flex items-center gap-2">
                  <FiShield size={20} className="text-emerald-600" />
                  Habilitar Backups Automáticos
                </span>
              </label>
              <p className="text-sm text-slate-600 mt-3 ml-18">
                Activa los backups programados según los días y horas configurados
              </p>
            </div>

            {settings.enabled && (
              <>
                {/* Días de la semana - Diseño Premium */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                    <FiCalendar className="text-emerald-600" size={18} />
                    Días para ejecutar backups
                  </label>
                  <div className="grid grid-cols-7 gap-3">
                    {daysOfWeek.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => toggleDay(day.value)}
                        className={`relative h-20 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg ${
                          settings.schedule_days.includes(day.value)
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white scale-105'
                            : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center h-full">
                          <span className="text-2xl font-bold">{day.short}</span>
                          <span className="text-xs mt-1">{day.label.slice(0, 3)}</span>
                        </div>
                        {settings.schedule_days.includes(day.value) && (
                          <div className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-lg">
                            <FiCheck className="text-emerald-600" size={14} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <FiInfo size={14} />
                    Selecciona uno o más días de la semana
                  </p>
                </div>

                {/* Horas - Diseño Mejorado */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                    <FiClock className="text-emerald-600" size={18} />
                    Horas para ejecutar backups
                  </label>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 max-h-80 overflow-y-auto">
                    <div className="grid grid-cols-6 gap-2">
                      {timesOfDay.map((time) => (
                        <button
                          key={time}
                          type="button"
                          onClick={() => toggleTime(time)}
                          className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                            settings.schedule_times.includes(time)
                              ? 'bg-emerald-600 text-white shadow-md'
                              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                    <FiInfo size={14} />
                    Selecciona una o más horas del día (formato 24 horas)
                  </p>
                </div>

                {/* Retención */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3">
                    <FiHardDrive className="text-emerald-600" size={18} />
                    Retención de backups
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={settings.retention_days}
                      onChange={(e) =>
                        setSettings({ ...settings, retention_days: parseInt(e.target.value) || 1 })
                      }
                      className="border-2 border-slate-300 rounded-lg px-4 py-3 w-24 text-center text-lg font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                    <span className="text-slate-700 font-medium">días</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                    <FiInfo size={14} />
                    Los backups más antiguos se eliminarán automáticamente
                  </p>
                </div>

                {/* Qué incluir en backups */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-4">
                    <FiDownload className="text-emerald-600" size={18} />
                    Contenido del backup
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <label
                      className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all ${
                        settings.include_db
                          ? 'border-emerald-500 bg-emerald-50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={settings.include_db}
                        onChange={(e) => setSettings({ ...settings, include_db: e.target.checked })}
                        className="sr-only"
                      />
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                            settings.include_db
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <FiDatabase size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 mb-1">Base de Datos</p>
                          <p className="text-xs text-slate-600">MySQL (db_wedding)</p>
                        </div>
                      </div>
                      {settings.include_db && (
                        <div className="absolute top-3 right-3 bg-emerald-600 rounded-full p-1">
                          <FiCheck className="text-white" size={14} />
                        </div>
                      )}
                    </label>

                    <label
                      className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all ${
                        settings.include_fotos
                          ? 'border-emerald-500 bg-emerald-50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={settings.include_fotos}
                        onChange={(e) =>
                          setSettings({ ...settings, include_fotos: e.target.checked })
                        }
                        className="sr-only"
                      />
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                            settings.include_fotos
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <FiImage size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 mb-1">Fotos de Bodas</p>
                          <p className="text-xs text-slate-600">storage/fotos_boda</p>
                        </div>
                      </div>
                      {settings.include_fotos && (
                        <div className="absolute top-3 right-3 bg-emerald-600 rounded-full p-1">
                          <FiCheck className="text-white" size={14} />
                        </div>
                      )}
                    </label>

                    <label
                      className={`relative cursor-pointer rounded-xl border-2 p-6 transition-all ${
                        settings.include_tarjetas
                          ? 'border-emerald-500 bg-emerald-50 shadow-md'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={settings.include_tarjetas}
                        onChange={(e) =>
                          setSettings({ ...settings, include_tarjetas: e.target.checked })
                        }
                        className="sr-only"
                      />
                      <div className="flex items-start gap-3">
                        <div
                          className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${
                            settings.include_tarjetas
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <FiCreditCard size={24} />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800 mb-1">Tarjetas RSVP</p>
                          <p className="text-xs text-slate-600">storage/tarjetas</p>
                        </div>
                      </div>
                      {settings.include_tarjetas && (
                        <div className="absolute top-3 right-3 bg-emerald-600 rounded-full p-1">
                          <FiCheck className="text-white" size={14} />
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Google Drive - Sección Premium */}
                <div className="bg-gradient-to-br from-blue-50 to-sky-50 p-8 rounded-xl border-2 border-blue-200">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <label className="flex items-center gap-2 text-lg font-bold text-slate-800 mb-2">
                        <FiCloud className="text-blue-600" size={24} />
                        Configuración de Google Drive
                      </label>
                      <p className="text-sm text-slate-600">
                        Los backups se subirán automáticamente a tu cuenta de Google Drive
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowDriveModal(true)}
                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1 text-sm font-semibold"
                    >
                      <FiInfo size={16} />
                      ¿Cómo configurar?
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Ruta en Google Drive
                      </label>
                      <input
                        type="text"
                        value={settings.drive_remote}
                        onChange={(e) =>
                          setSettings({ ...settings, drive_remote: e.target.value })
                        }
                        placeholder="gdrive:mi-boda/backups"
                        className="w-full border-2 border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                      />
                      <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <FiInfo size={14} />
                        Ejemplo: <code className="bg-white px-2 py-0.5 rounded">gdrive:mi-boda/backups</code>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyDrive}
                      disabled={verifying || !settings.drive_remote}
                      className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
                    >
                      {verifying ? (
                        <>
                          <ImSpinner2 className="animate-spin" size={16} />
                          Verificando...
                        </>
                      ) : (
                        <>
                          <FiCheckCircle size={16} />
                          Verificar Conexión
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Botones de acción */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-200">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
              >
                {saving ? (
                  <>
                    <ImSpinner2 className="animate-spin" size={16} />
                    Guardando...
                  </>
                ) : (
                  <>
                    <FiSave size={16} />
                    Guardar Configuración
                  </>
                )}
              </button>
              <p className="text-sm text-slate-500">
                Los cambios se aplicarán inmediatamente
              </p>
            </div>
          </form>
        </div>
      )}

      {/* TAB: Historial */}
      {activeTab === 'history' && (
        <div className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <FiClock className="text-emerald-600" size={24} />
                Historial de Backups
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Últimos 20 backups ejecutados
              </p>
            </div>
            <button
              onClick={fetchHistory}
              className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2 font-semibold"
            >
              <FiRefreshCw size={16} />
              Recargar
            </button>
          </div>

          {history.length === 0 ? (
            <div className="bg-slate-50 rounded-xl p-12 text-center border-2 border-dashed border-slate-300">
              <FiClock className="mx-auto text-slate-400 mb-4" size={48} />
              <p className="text-slate-600 font-medium mb-2">No hay backups registrados</p>
              <p className="text-sm text-slate-500">
                Los backups aparecerán aquí una vez que se ejecuten
              </p>
            </div>
          ) : (
            <>
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100">
                      <tr>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Fecha y Hora
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="text-left py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Archivo
                        </th>
                        <th className="text-right py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Tamaño
                        </th>
                        <th className="text-center py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Duración
                        </th>
                        <th className="text-center py-4 px-6 text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Google Drive
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {history.map((run) => (
                        <tr key={run.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              <FiCalendar className="text-slate-400" size={16} />
                              <span className="text-sm font-medium text-slate-800">
                                {formatDate(run.started_at)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {run.status === 'success' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                <FiCheckCircle size={14} />
                                EXITOSO
                              </span>
                            ) : run.status === 'failed' ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                                <FiAlertCircle size={14} />
                                FALLIDO
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                                <ImSpinner2 className="animate-spin" size={14} />
                                EN PROCESO
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <span className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded">
                              {run.file_name || '-'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className="text-sm font-semibold text-slate-800">
                              {formatBytes(run.file_size_mb * 1024 * 1024)}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className="text-sm text-slate-600">
                              {run.duration_seconds ? `${run.duration_seconds}s` : '-'}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            {run.drive_path ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold text-sm">
                                <FiCloud size={16} />
                                Subido
                              </span>
                            ) : (
                              <span className="text-slate-400 text-sm">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Alerta de fallos */}
              {history.some((r) => r.status === 'failed') && (
                <div className="mt-6 bg-rose-50 border-l-4 border-rose-500 p-6 rounded-lg">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="text-rose-600 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                      <p className="font-semibold text-rose-800 mb-1">
                        Atención: Backups fallidos detectados
                      </p>
                      <p className="text-sm text-rose-700">
                        Hay backups con estado "fallido". Revisa los logs del servidor o intenta ejecutar un backup manual.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* TAB: Estadísticas */}
      {activeTab === 'stats' && stats && (
        <div className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <FiBarChart2 className="text-emerald-600" size={24} />
              Estadísticas y Métricas
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Resumen del rendimiento de tus backups
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total de Backups */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <FiHardDrive className="text-blue-600" size={24} />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">Total de Backups</h3>
              <p className="text-3xl font-bold text-slate-800">{stats.total_runs}</p>
              <p className="text-xs text-slate-500 mt-2">Backups ejecutados</p>
            </div>

            {/* Tasa de Éxito */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-emerald-100 p-3 rounded-lg">
                  <FiCheckCircle className="text-emerald-600" size={24} />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">Tasa de Éxito</h3>
              <p className="text-3xl font-bold text-emerald-600">{stats.success_rate}%</p>
              <p className="text-xs text-slate-500 mt-2">
                {stats.successful_runs} exitosos, {stats.failed_runs} fallidos
              </p>
            </div>

            {/* Último Backup */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FiClock className="text-purple-600" size={24} />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">Último Backup</h3>
              <p className="text-sm font-semibold text-slate-800 mt-2">
                {stats.last_successful_backup ? formatDate(stats.last_successful_backup) : 'Ninguno'}
              </p>
            </div>

            {/* Tamaño Total */}
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-amber-500">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-amber-100 p-3 rounded-lg">
                  <FiDownload className="text-amber-600" size={24} />
                </div>
              </div>
              <h3 className="text-sm font-semibold text-slate-600 mb-1">Tamaño Total</h3>
              <p className="text-3xl font-bold text-slate-800">{stats.total_backup_size_gb} GB</p>
              <p className="text-xs text-slate-500 mt-2">
                Promedio: {stats.avg_backup_size_mb} MB
              </p>
            </div>
          </div>

          {/* Uso de Google Drive */}
          {driveUsage && (
            <div className="bg-gradient-to-br from-blue-50 to-sky-50 rounded-xl shadow-lg p-8 border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 p-3 rounded-lg">
                  <FiCloud className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Uso de Google Drive</h3>
                  <p className="text-sm text-slate-600">Espacio utilizado por tus backups</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">
                    {driveUsage.used_gb} GB usados
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {driveUsage.usage_percent}%
                  </span>
                </div>
                
                <div className="w-full bg-slate-200 rounded-full h-6 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${Math.min(driveUsage.usage_percent, 100)}%` }}
                  >
                    {driveUsage.usage_percent > 10 && (
                      <span className="text-xs font-bold text-white">
                        {driveUsage.usage_percent}%
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="bg-white rounded-lg p-4 shadow">
                    <p className="text-xs text-slate-500 mb-1">Total disponible</p>
                    <p className="text-lg font-bold text-slate-800">{driveUsage.total_gb} GB</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow">
                    <p className="text-xs text-slate-500 mb-1">Espacio libre</p>
                    <p className="text-lg font-bold text-emerald-600">{driveUsage.free_gb} GB</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Modal de Ayuda - Configuración Google Drive */}
      {showDriveModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header del Modal */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
                    <FiCloud size={28} />
                    Configurar Google Drive
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Guía paso a paso para conectar tus backups con Google Drive
                  </p>
                </div>
                <button
                  onClick={() => setShowDriveModal(false)}
                  className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="p-6 space-y-6">
              {/* Paso 1 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 mb-2">Crear carpeta en Google Drive</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    En tu cuenta de Google (la del servidor), crea una carpeta en Google Drive para los backups. Ejemplo:
                  </p>
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                    <p className="text-sm font-mono text-slate-800">📁 mi-boda/backups</p>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Esta carpeta NO necesita estar compartida, solo visible en tu Google Drive
                  </p>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 mb-2">Ingresar la ruta en esta app</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Copia la ruta exacta de tu carpeta en el formato que pide:
                  </p>
                  <div className="bg-slate-900 text-emerald-400 p-4 rounded-lg font-mono text-sm">
                    <code>gdrive:mi-boda/backups</code>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Reemplaza con la estructura exacta de tu carpeta
                  </p>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-slate-800 mb-2">Verificar conexión</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Haz clic en <strong>"Verificar Conexión"</strong> para confirmar que funciona.
                  </p>
                  <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded flex items-start gap-2">
                    <FiCheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-emerald-800">
                      ¡Listo! Los backups se guardarán automáticamente en esa carpeta.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer del Modal */}
            <div className="bg-slate-50 p-6 rounded-b-2xl border-t border-slate-200">
              <button
                onClick={() => setShowDriveModal(false)}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupAdmin;
