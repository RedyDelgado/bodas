import { useState, useEffect } from 'react';
import { FiSearch, FiUserCheck, FiUserX, FiEye, FiDownload, FiTrash2, FiAlertCircle } from 'react-icons/fi';
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
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Gestión de Usuarios</h1>
          <p className="text-slate-600">Administración avanzada de usuarios de la plataforma</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={abrirModalCrear}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <FiUserCheck size={18} />
            <span>Crear superadmin</span>
          </button>
          <button
            onClick={exportarUsuarios}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FiDownload size={18} />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre o email..."
              value={buscar}
              onChange={(e) => {
                setBuscar(e.target.value);
                setPaginaActual(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Nombre</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Rol</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Bodas</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 text-sm text-slate-600">{usuario.id}</td>
                      <td className="py-3 px-4 text-sm text-slate-800 font-medium">{usuario.name}</td>
                      <td className="py-3 px-4 text-sm text-slate-600">{usuario.email}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                          {usuario.role?.nombre || usuario.rol?.nombre || 'Sin rol'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{usuario.bodas_count || 0}</td>
                      <td className="py-3 px-4">
                        {usuario.suspendido ? (
                          <span className="flex items-center gap-1 text-red-600 text-sm">
                            <FiAlertCircle size={16} />
                            <span>Suspendido</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <FiUserCheck size={16} />
                            <span>Activo</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          {usuario.role?.nombre !== 'superadmin' && usuario.rol?.nombre !== 'superadmin' && (
                            <>
                              <button
                                onClick={() => impersonarUsuario(usuario)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Ver como usuario"
                              >
                                <FiEye size={18} />
                              </button>
                              
                              {usuario.suspendido ? (
                                <button
                                  onClick={() => abrirModal(usuario, 'activar')}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Activar usuario"
                                >
                                  <FiUserCheck size={18} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => abrirModal(usuario, 'suspender')}
                                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                  title="Suspender usuario"
                                >
                                  <FiUserX size={18} />
                                </button>
                              )}
                              
                              <button
                                onClick={() => abrirModal(usuario, 'eliminar')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">
          {accion === 'suspender' && 'Suspender Usuario'}
          {accion === 'activar' && 'Activar Usuario'}
          {accion === 'eliminar' && 'Eliminar Usuario'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <p className="text-slate-600 mb-2">
              Usuario: <strong>{usuario.name}</strong> ({usuario.email})
            </p>
          </div>

          {(accion === 'suspender' || accion === 'eliminar') && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Razón {accion === 'suspender' ? 'de suspensión' : 'de eliminación'}
              </label>
              <textarea
                value={razon}
                onChange={(e) => setRazon(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                placeholder="Explica la razón..."
              />
            </div>
          )}

          {accion === 'eliminar' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="permanente"
                checked={permanente}
                onChange={(e) => setPermanente(e.target.checked)}
                className="rounded border-slate-300"
              />
              <label htmlFor="permanente" className="text-sm text-slate-700">
                Eliminar permanentemente (no se puede recuperar)
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCerrar}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                accion === 'eliminar'
                  ? 'bg-red-600 hover:bg-red-700'
                  : accion === 'suspender'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {accion === 'suspender' && 'Suspender'}
              {accion === 'activar' && 'Activar'}
              {accion === 'eliminar' && 'Eliminar'}
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
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-slate-800 mb-4">Crear superadmin</h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre completo</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Ej: Ana Rojas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono (opcional)</label>
            <input
              type="text"
              value={form.telefono}
              onChange={(e) => onChange({ ...form, telefono: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="+51 999 999 999"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => onChange({ ...form, password: e.target.value })}
              required
              minLength={8}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Creando...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GestionUsuariosPage;
