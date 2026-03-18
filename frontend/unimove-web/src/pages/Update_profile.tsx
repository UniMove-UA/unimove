import React, { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Car, Save, Loader2, ArrowLeft } from 'lucide-react';
import axios from 'axios';


const UpdateProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    correo_institucional: '',
    phone: '',
  });

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await axios.get('http://127.0.0.1:8000/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const user = response.data;
        setFormData({
          name: user.name || '',
          email: user.email || '',
          correo_institucional: user.correo_institucional || '',
          phone: user.phone || '',
        });
      } catch (error) {
        console.error("Error al cargar perfil", error);
      }
    };
    loadProfile();
  }, []);

  // Función para manejar el guardado
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      await axios.put('http://127.0.0.1:8000/api/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      alert("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative">
      <video autoPlay loop muted playsInline className="fixed inset-0 w-full h-full object-cover -z-10">
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>

      <div className="fixed inset-0 bg-black/20 -z-10"></div>
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-[#7ba696]/20">
        <div className="bg-gradient-to-br from-[#1d3531] to-[#2d5a50] p-10 text-white relative">
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight">Configuración de Perfil</h1>
            <p className="text-[#a7d7c5] text-sm mt-2 font-medium opacity-90">
              Personaliza tu experiencia en la red de movilidad UniMove.
            </p>
          </div>
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8 bg-white">

          <div className="grid grid-cols-1 md:grid-cols-1 gap-x-8 gap-y-6">

            <div className="space-y-2 group">
              <label className="text-xs font-black uppercase tracking-widest text-[#1d3531] flex items-center gap-2 opacity-70 group-focus-within:opacity-100 transition-opacity">
                <User size={14} strokeWidth={3} /> Nombre Completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ej. Juan Pérez"
                className="w-full px-0 py-2 bg-transparent border-b-2 border-[#7ba696]/30 focus:border-[#1d3531] outline-none transition-all placeholder:text-gray-400 text-gray-800"
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-black uppercase tracking-widest text-[#1d3531] flex items-center gap-2">
                <Mail size={14} strokeWidth={3} /> Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="usuario@email.com"
                className="w-full px-0 py-2 bg-transparent border-b-2 border-[#7ba696]/30 focus:border-[#1d3531] outline-none transition-all placeholder:text-gray-400 text-gray-800"
              />
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-black uppercase tracking-widest text-[#1d3531] flex items-center gap-2">
                <Mail size={14} strokeWidth={3} /> Email Institucional
              </label>
              <div
                className={`w-full px-0 py-2 bg-transparent border-b-2 border-[#7ba696]/30 outline-none transition-all cursor-not-allowed ${formData.correo_institucional ? 'text-gray-800' : 'text-gray-400'
                  }`}
              >
                {formData.correo_institucional || 'No vinculado'}
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-xs font-black uppercase tracking-widest text-[#1d3531] flex items-center gap-2 opacity-70 group-focus-within:opacity-100 transition-opacity">
                <Phone size={14} strokeWidth={3} /> Teléfono de Contacto
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="999888777"
                className="w-full px-0 py-2 bg-transparent border-b-2 border-[#7ba696]/30 focus:border-[#1d3531] outline-none transition-all placeholder:text-gray-400 text-gray-800"
              />
            </div>
          </div>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#7ba696]/10"></span></div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm font-bold text-[#7ba696] hover:text-[#1d3531] transition-colors order-2 md:order-1"
            >
              <ArrowLeft size={16} /> Volver al inicio
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-10 py-4 bg-[#1d3531] text-white font-bold rounded-2xl hover:bg-[#2d5a50] shadow-[0_10px_20px_rgba(29,53,49,0.2)] flex items-center justify-center gap-3 disabled:opacity-70 transition-all active:scale-95 order-1 md:order-2"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? 'Guardando...' : 'Guardar Perfil'}
            </button>
          </div>
        </form>
      </div>

      <p className="relative z-10 mt-8 text-white/80 text-xs font-bold tracking-[0.2em] uppercase bg-black/20 backdrop-blur-md px-4 py-2 rounded-full">
        UniMove &copy; 2026 • Campus Mobility
      </p>
    </div>
  );
};

export default UpdateProfile;