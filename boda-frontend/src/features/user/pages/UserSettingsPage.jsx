import { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import { FiEye, FiEyeOff, FiSave, FiMail, FiUser } from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';
import axiosClient from '../../../shared/config/axiosClient';

export function UserSettingsPage() {
  const { usuario, setUsuario } = useAuth();
  
  const [formData, setFormData] = useState({
    name: usuario?.name || '',
    telefono: usuario?.telefono || '',
    password: '',
    password_confirmation: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    // Validar contraseñas si se están cambiando
    if (formData.password && formData.password !== formData.password_confirmation) {
      setMensaje({ tipo: 'error', texto: 'Las contraseñas no coinciden' });
      return;
    }

    setCargando(true);
    try {
      const dataToSend = {
        name: formData.name,
        telefono: formData.telefono
      };

      // Solo enviar password si se llenó
      if (formData.password) {
        dataToSend.password = formData.password;
      }

      const response = await axiosClient.put('/api/user/profile', dataToSend);
      
      // Actualizar contexto de auth
      setUsuario(response.data.usuario);
      
      setMensaje({ tipo: 'success', texto: 'Perfil actualizado correctamente' });
      
      // Limpiar campos de contraseña
      setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }));
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Error al actualizar perfil';
      setMensaje({ tipo: 'error', texto: errorMsg });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Ajustes de la cuenta</h1>
          <p className="text-sm text-slate-600 mt-1">
            Administra tu información personal y credenciales de acceso
          </p>
        </div>

        {/* Información Personal */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <FiUser className="text-slate-700" size={20} />
            <h2 className="text-lg font-semibold text-slate-800">Información Personal</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                value={usuario?.email || ''}
                disabled
                className="w-full border border-slate-300 rounded-lg px-3 py-2 pl-10 text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
              />
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              El correo no se puede modificar
            </p>
          </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                name="name"
                required
                minLength={3}
                value={formData.name}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Teléfono <span className="text-slate-400 text-xs">(opcional)</span>
              </label>
              <input
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500 transition-all"
                placeholder="+54 9 11 1234-5678"
              />
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">
                Cambiar contraseña <span className="text-slate-400 font-normal text-xs">(opcional)</span>
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      minLength={6}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      placeholder="Dejar en blanco para mantener actual"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confirmar nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordConfirmation ? 'text' : 'password'}
                      name="password_confirmation"
                      minLength={6}
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                      placeholder="Repetir nueva contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPasswordConfirmation ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {mensaje.texto && (
              <div className={`rounded-lg px-4 py-3 text-sm ${
                mensaje.tipo === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-700' 
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}>
                {mensaje.texto}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {cargando ? (
                <>
                  <ImSpinner2 className="animate-spin" size={18} />
                  Guardando...
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  Guardar cambios
                </>
              )}
            </button>
          </form>
        </div>

        {/* Nota informativa */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Para modificar los datos de tu boda (nombres, fecha, dominio, etc.), dirígete al Dashboard desde el menú lateral.
          </p>
        </div>
      </div>
    </div>
  );
}
