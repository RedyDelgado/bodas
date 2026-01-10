import { useState, useEffect } from 'react';
import { FiSearch, FiUserCheck, FiUserX, FiEye, FiDownload, FiTrash2, FiAlertCircle, FiCheckCircle, FiUsers, FiPlus } from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';
import axiosClient from '../../../shared/config/axiosClient';

const GestionUsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [buscar, setBuscar] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [accionModal, setAccionModal] = useState('');
  const [modalCrearAbierto, setModalCrearAbierto] = useState(false);
  const [formCrear, setFormCrear] = useState({ name: '', email: '', password: '', telefono: '' });
  const [creandoSuperadmin, setCreandoSuperadmin] = useState(false);
  const [errorCrear, setErrorCrear] = useState('');

  useEffect(() => {
    cargarUsuarios();
  }, [paginaActual, buscar]);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const params = new URLSearchParams({
        page: paginaActual,
        ...(buscar && { buscar }),
      });
      
      const response = await axiosClient.get(`/superadmin/usuarios?${params}`);
      setUsuarios(response.data.usuarios.data);
      setTotalPaginas(response.data.usuarios.last_page);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    } finally {
      setCargando(false);
    }
  };

  const abrirModal = (usuario, accion) => {
    setUsuarioSeleccionado(usuario);
    setAccionModal(accion);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
    setAccionModal('');
  };

  const abrirModalCrear = () => {
    setFormCrear({ name: '', email: '', password: '', telefono: '' });
    setErrorCrear('');
    setModalCrearAbierto(true);
  };

  const cerrarModalCrear = () => {
    setModalCrearAbierto(false);
    setErrorCrear('');
  };

  const suspenderUsuario = async (razon) => {
    try {
      await axiosClient.put(`/superadmin/usuarios/${usuarioSeleccionado.id}/estado`, {
        suspendido: true,
        razon,
      });
      cargarUsuarios();
      cerrarModal();
    } catch (error) {
      console.error('Error suspendiendo usuario:', error);
      alert('Error al suspender usuario');
    }
  };

  const activarUsuario = async () => {
    try {
      await axiosClient.put(`/superadmin/usuarios/${usuarioSeleccionado.id}/estado`, {
        suspendido: false,
      });
      cargarUsuarios();
      cerrarModal();
    } catch (error) {
      console.error('Error activando usuario:', error);
      alert('Error al activar usuario');
    }
  };

  const impersonarUsuario = async (usuario) => {
    try {
      const response = await axiosClient.post(`/superadmin/usuarios/${usuario.id}/impersonate`);
      alert(`Impersonación iniciada como ${usuario.name}`);
      // Aquí podrías redirigir o cambiar el token temporalmente
      console.log('Token de impersonación:', response.data.token);
    } catch (error) {
      console.error('Error impersonando usuario:', error);
      alert('Error al impersonar usuario');
    }
  };

  const crearSuperadmin = async (e) => {
    e.preventDefault();
    setErrorCrear('');
    try {
      setCreandoSuperadmin(true);
      await axiosClient.post('/superadmin/usuarios/superadmin', {
        name: formCrear.name,
        email: formCrear.email,
        password: formCrear.password,
        telefono: formCrear.telefono || null,
      });
      alert('Superadmin creado exitosamente');
      cerrarModalCrear();
      cargarUsuarios();
    } catch (error) {
      console.error('Error creando superadmin:', error);
      const msg = error?.response?.data?.message || 'Error al crear superadmin';
      setErrorCrear(msg);
    } finally {
      setCreandoSuperadmin(false);
    }
  };

  const exportarUsuarios = async () => {
    try {
      const response = await axiosClient.get('/superadmin/usuarios/exportar');
      const csvContent = response.data.data.map((row) => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', response.data.filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exportando usuarios:', error);
      alert('Error al exportar usuarios');
    }
  };

  const eliminarUsuario = async (razon, permanente = false) => {
    try {
      await axiosClient.delete(`/superadmin/usuarios/${usuarioSeleccionado.id}`, {
        data: { razon, permanente },
      });
      cargarUsuarios();
      cerrarModal();
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      alert('Error al eliminar usuario');
    }
  };

  return (
    <div className="space-y-5 text-[14px]">
      {/* Encabezado Premium */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-1.5 flex items-center gap-2">
            <FiUsers className="text-slate-600" size={26} />
            Gestión de Usuarios
          </h1>
          <p className="text-slate-600 text-[13px]">Administración avanzada de usuarios de la plataforma</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
          >
            <FiPlus size={18} />
            <span>Crear Superadmin</span>
          </button>
          <button
            onClick={exportarUsuarios}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm"
          >
            <FiDownload size={18} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Búsqueda Premium */}
      <div className="bg-white rounded-xl shadow-lg p-4 border border-slate-200">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar usuarios..."
              value={buscar}
              onChange={(e) => {
                setBuscar(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full pl-12 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Tabla de usuarios Premium */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        {cargando ? (
          <div className="flex justify-center items-center h-64">
            <ImSpinner2 className="animate-spin text-slate-700" size={40} />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 text-xs uppercase">
                  <tr>
                    <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">ID</th>
                    <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">Nombre</th>
                    <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">Email</th>
                    <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">Rol</th>
                    <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">Bodas</th>
                    <th className="text-left py-3 px-5 font-bold text-slate-700 tracking-wider">Estado</th>
                    <th className="text-right py-3 px-5 font-bold text-slate-700 tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-5 text-sm text-slate-600">{usuario.id}</td>
                      <td className="py-3 px-5 text-sm text-slate-800 font-semibold">{usuario.name}</td>
                      <td className="py-3 px-5 text-sm text-slate-600">{usuario.email}</td>
                      <td className="py-4 px-6 text-sm">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                          {usuario.role?.nombre || usuario.rol?.nombre || 'Sin rol'}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-sm text-slate-600">{usuario.bodas_count || 0}</td>
                      <td className="py-3 px-5">
                        {usuario.suspendido ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                            <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                            Suspendido
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                            <span className="w-2 h-2 bg-emerald-600 rounded-full"></span>
                            Activo
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-5">
                        <div className="flex items-center justify-end gap-1.5">
                          {usuario.role?.nombre !== 'superadmin' && usuario.rol?.nombre !== 'superadmin' && (
                            <>
                              <button
                                onClick={() => impersonarUsuario(usuario)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ver como usuario"
                              >
                                <FiEye size={18} />
                              </button>
                              
                              {usuario.suspendido ? (
                                <button
                                  onClick={() => abrirModal(usuario, 'activar')}
                                  className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title="Activar usuario"
                                >
                                  <FiUserCheck size={18} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => abrirModal(usuario, 'suspender')}
                                  className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                  title="Suspender usuario"
                                >
                                  <FiUserX size={18} />
                                </button>
                              )}
                              
                              <button
                                onClick={() => abrirModal(usuario, 'eliminar')}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Eliminar usuario"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación Premium */}
            {totalPaginas > 1 && (
              <div className="px-5 py-3.5 bg-gradient-to-r from-slate-50 to-slate-100 border-t border-slate-200 flex items-center justify-between text-sm">
                <div className="font-semibold text-slate-700">
                  Página {paginaActual} de {totalPaginas}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPaginaActual((p) => Math.max(1, p - 1))}
                    disabled={paginaActual === 1}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-white hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setPaginaActual((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaActual === totalPaginas}
                    className="px-3 py-1.5 border border-slate-300 rounded-lg font-semibold text-slate-700 hover:bg-white hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de acciones */}
      {modalAbierto && (
        <ModalAccion
          usuario={usuarioSeleccionado}
          accion={accionModal}
          onCerrar={cerrarModal}
          onSuspender={suspenderUsuario}
          onActivar={activarUsuario}
          onEliminar={eliminarUsuario}
        />
      )}

      {modalCrearAbierto && (
        <ModalCrearSuperadmin
          form={formCrear}
          onChange={setFormCrear}
          onClose={cerrarModalCrear}
          onSubmit={crearSuperadmin}
          loading={creandoSuperadmin}
          error={errorCrear}
        />
      )}
    </div>
  );
};

// Modal de confirmación de acciones
const ModalAccion = ({ usuario, accion, onCerrar, onSuspender, onActivar, onEliminar }) => {
  const [razon, setRazon] = useState('');
  const [permanente, setPermanente] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (accion === 'suspender') {
      onSuspender(razon);
    } else if (accion === 'activar') {
      onActivar();
    } else if (accion === 'eliminar') {
      onEliminar(razon, permanente);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
        <h3 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
          {accion === 'suspender' && (
            <>
              <FiAlertCircle className="text-amber-600" size={24} />
              Suspender Usuario
            </>
          )}
          {accion === 'activar' && (
            <>
              <FiCheckCircle className="text-emerald-600" size={24} />
              Activar Usuario
            </>
          )}
          {accion === 'eliminar' && (
            <>
              <FiAlertCircle className="text-rose-600" size={24} />
              Eliminar Usuario
            </>
          )}
        </h3>
        <p className="text-slate-600 text-sm mb-4">Usuario: <span className="font-semibold text-slate-800">{usuario.name}</span></p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {(accion === 'suspender' || accion === 'eliminar') && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">
                Razón {accion === 'suspender' ? 'de suspensión' : 'de eliminación'}
              </label>
              <textarea
                value={razon}
                onChange={(e) => setRazon(e.target.value)}
                required
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent resize-none"
                placeholder="Explica la razón..."
              />
            </div>
          )}

          {accion === 'eliminar' && (
            <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg border border-rose-200">
              <input
                type="checkbox"
                id="permanente"
                checked={permanente}
                onChange={(e) => setPermanente(e.target.checked)}
                className="rounded border-slate-300 mt-0.5"
              />
              <label htmlFor="permanente" className="text-sm text-slate-700 font-medium">
                <span className="font-semibold text-rose-700">Eliminar permanentemente</span> - Esta acción no se puede recuperar
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-semibold text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-all font-semibold text-sm shadow-md hover:shadow-lg ${
                accion === 'eliminar'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : accion === 'suspender'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {accion === 'suspender' && 'Suspender Usuario'}
              {accion === 'activar' && 'Activar Usuario'}
              {accion === 'eliminar' && 'Eliminar Definitivamente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para crear superadmin
const ModalCrearSuperadmin = ({ form, onChange, onClose, onSubmit, loading, error }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200">
        <h3 className="text-2xl font-bold text-slate-800 mb-1 flex items-center gap-2">
          <FiUsers className="text-slate-600" size={24} />
          Crear Superadmin
        </h3>
        <p className="text-slate-600 text-sm mb-4">Otorgar acceso administrativo a nuevo usuario</p>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm flex items-start gap-2">
            <FiAlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Nombre completo</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="Ej: Ana Rojas"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Teléfono (opcional)</label>
            <input
              type="text"
              value={form.telefono}
              onChange={(e) => onChange({ ...form, telefono: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="+51 999 999 999"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 uppercase tracking-wider">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => onChange({ ...form, password: e.target.value })}
              required
              minLength={8}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              placeholder="Mínimo 8 caracteres"
            />
            <p className="text-xs text-slate-600 mt-1">Debe contener al menos 8 caracteres</p>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-all font-semibold text-sm disabled:opacity-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-all font-semibold text-sm shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading && <ImSpinner2 className="animate-spin" size={16} />}

              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GestionUsuariosPage;
