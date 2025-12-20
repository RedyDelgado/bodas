import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';
import { ImSpinner2 } from 'react-icons/im';

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, cargando, error } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    nombre_pareja: '',
    subdominio: '',
    fecha_boda: '',
    ciudad: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [isSubdominioValid, setIsSubdominioValid] = useState(null);
  const [errorLocal, setErrorLocal] = useState('');

  // Validación de coincidencia de contraseñas
  useEffect(() => {
    if (formData.password && formData.password_confirmation) {
      setPasswordMatch(formData.password === formData.password_confirmation);
    } else {
      setPasswordMatch(null);
    }
  }, [formData.password, formData.password_confirmation]);

  // Validación de subdominio (solo letras minúsculas, números y guiones, mínimo 3 caracteres)
  useEffect(() => {
    if (formData.subdominio) {
      const regex = /^[a-z0-9-]+$/;
      setIsSubdominioValid(
        regex.test(formData.subdominio) && formData.subdominio.length >= 3
      );
    } else {
      setIsSubdominioValid(null);
    }
  }, [formData.subdominio]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si es el subdominio, limpiar caracteres no permitidos
    if (name === 'subdominio') {
      const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
      setFormData({ ...formData, [name]: cleaned });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorLocal('');

    if (formData.password !== formData.password_confirmation) {
      setErrorLocal('Las contraseñas no coinciden');
      return;
    }

    if (!isSubdominioValid) {
      setErrorLocal('El subdominio debe tener al menos 3 caracteres y solo letras, números y guiones');
      return;
    }

    try {
      const result = await register(formData);
      if (result.ok) {
        // Redirigir al panel de la boda
        navigate('/panel');
      }
      // Si result.ok es false, el error ya se muestra desde el contexto
    } catch (err) {
      console.error('Error en registro:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl overflow-hidden">
        {/* Header simple */}
        <div className="px-8 py-6 border-b border-slate-200">
          <h1 className="text-2xl font-semibold text-slate-800 mb-1">
            Crear cuenta
          </h1>
          <p className="text-sm text-slate-500">
            Completa el formulario para comenzar a planificar tu boda
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Sección 1: Información Personal */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-200">
              <h2 className="text-base font-medium text-slate-700">
                Información Personal
              </h2>
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
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder="Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          {/* Sección 2: Seguridad */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-200">
              <h2 className="text-base font-medium text-slate-700">
                Seguridad de tu Cuenta
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Mínimo 6 caracteres"
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
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  name="password_confirmation"
                  required
                  minLength={6}
                  value={formData.password_confirmation}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 pr-16 text-sm focus:outline-none focus:ring-2
                    ${passwordMatch === null ? 'border-slate-300 focus:ring-slate-500' : ''}
                    ${passwordMatch === true ? 'border-green-400 bg-green-50 focus:ring-green-500' : ''}
                    ${passwordMatch === false ? 'border-red-400 bg-red-50 focus:ring-red-500' : ''}
                  `}
                  placeholder="Repite tu contraseña"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  {passwordMatch !== null && (
                    <span className={passwordMatch ? 'text-green-600' : 'text-red-600'}>
                      {passwordMatch ? <FiCheck size={16} /> : <FiX size={16} />}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    {showPasswordConfirmation ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>
              {passwordMatch === false && (
                <p className="text-xs text-red-600 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>
          </div>

          {/* Sección 3: Datos de la Boda */}
          <div className="space-y-4">
            <div className="pb-2 border-b border-slate-200">
              <h2 className="text-base font-medium text-slate-700">
                Datos de tu Boda
              </h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nombres de la pareja
              </label>
              <input
                type="text"
                name="nombre_pareja"
                required
                minLength={3}
                value={formData.nombre_pareja}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder="María & Juan"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Subdominio de tu boda
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="subdominio"
                  required
                  minLength={3}
                  value={formData.subdominio}
                  onChange={handleChange}
                  className={`w-full border rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2
                    ${isSubdominioValid === null ? 'border-slate-300 focus:ring-slate-500' : ''}
                    ${isSubdominioValid === true ? 'border-green-400 bg-green-50 focus:ring-green-500' : ''}
                    ${isSubdominioValid === false ? 'border-red-400 bg-red-50 focus:ring-red-500' : ''}
                  `}
                  placeholder="maria-y-juan"
                />
                {isSubdominioValid !== null && (
                  <span className={`absolute right-3 top-1/2 -translate-y-1/2 ${isSubdominioValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isSubdominioValid ? <FiCheck size={16} /> : <FiX size={16} />}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Tu boda estará en: <span className="font-medium text-slate-700">{formData.subdominio || 'tu-subdominio'}.miboda.com</span>
              </p>
              {isSubdominioValid === false && (
                <p className="text-xs text-red-600 mt-1">Solo letras minúsculas, números y guiones (mínimo 3 caracteres)</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fecha de la boda
                </label>
                <input
                  type="date"
                  name="fecha_boda"
                  value={formData.fecha_boda}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Debe ser hoy o una fecha futura
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  name="ciudad"
                  value={formData.ciudad}
                  onChange={handleChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="Buenos Aires"
                />
              </div>
            </div>
          </div>

          {/* Mensajes de error */}
          {(error || errorLocal) && (
            <div className="bg-red-50 border border-red-100 text-red-600 rounded-lg px-3 py-2 text-sm">
              {errorLocal || error}
            </div>
          )}

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={cargando || passwordMatch === false || isSubdominioValid === false}
            className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {cargando ? (
              <>
                <ImSpinner2 className="animate-spin" size={18} />
                Creando cuenta...
              </>
            ) : (
              'Crear mi cuenta'
            )}
          </button>
        </form>

        <div className="px-8 pb-8">
          <p className="text-center text-sm text-slate-600">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-slate-800 font-medium hover:text-slate-900">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
