import React, { useState } from 'react';
import { User, Mail, Phone, Car, Save, Loader2, ArrowLeft } from 'lucide-react';

const UpdateProfile = () => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulación de API
    setTimeout(() => setLoading(false), 2000); 
  };

  return (
    /* Contenedor Padre: Centrado absoluto en pantalla */
    <div className="min-h-screen bg-[#f4f2ee] flex flex-col items-center justify-center p-4 md:p-8">
      
      {/* Tarjeta Principal: Ajustamos max-w-2xl para que luzca bien en escritorio y móvil */}
      <div className="w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-[#7ba696]/20">
        
        {/* Header con degradado Algae Deep */}
        <div className="bg-gradient-to-br from-[#1d3531] to-[#2d5a50] p-10 text-white relative">
          <div className="relative z-10">
            <h1 className="text-3xl font-extrabold tracking-tight">Configuración de Perfil</h1>
            <p className="text-[#a7d7c5] text-sm mt-2 font-medium opacity-90">
              Personaliza tu experiencia en la red de movilidad UniMove.
            </p>
          </div>
          {/* Círculo decorativo sutil */}
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          
          {/* Grid de 2 columnas manteniendo tu estructura original */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            
            {/* Nombre */}
            <div className="space-y-2 group">
              <label className="text-xs font-black uppercase tracking-widest text-[#1d3531] flex items-center gap-2 opacity-70 group-focus-within:opacity-100 transition-opacity">
                <User size={14} strokeWidth={3} /> Nombre Completo
              </label>
              <input 
                type="text" 
                placeholder="Ej. Juan Pérez"
                className="w-full px-0 py-2 bg-transparent border-b-2 border-[#7ba696]/30 focus:border-[#1d3531] outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Email */}
            <div className="space-y-2 opacity-60">
              <label className="text-xs font-black uppercase tracking-widest text-[#1d3531] flex items-center gap-2">
                <Mail size={14} strokeWidth={3} /> Correo Institucional
              </label>
              <input 
                type="email" 
                disabled
                value="usuario@universidad.edu"
                className="w-full px-0 py-2 bg-transparent border-b-2 border-gray-200 text-gray-400 cursor-not-allowed outline-none"
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2 group">
              <label className="text-xs font-black uppercase tracking-widest text-[#1d3531] flex items-center gap-2 opacity-70 group-focus-within:opacity-100 transition-opacity">
                <Phone size={14} strokeWidth={3} /> Teléfono de Contacto
              </label>
              <input 
                type="tel" 
                placeholder="+34 600 000 000"
                className="w-full px-0 py-2 bg-transparent border-b-2 border-[#7ba696]/30 focus:border-[#1d3531] outline-none transition-all placeholder:text-gray-300"
              />
            </div>

            {/* Vehículo */}
            <div className="space-y-2 group">
              <label className="text-xs font-black uppercase tracking-widest text-[#1d3531] flex items-center gap-2 opacity-70 group-focus-within:opacity-100 transition-opacity">
                <Car size={14} strokeWidth={3} /> Matrícula del Vehículo
              </label>
              <input 
                type="text" 
                placeholder="1234 ABC"
                className="w-full px-0 py-2 bg-transparent border-b-2 border-[#7ba696]/30 focus:border-[#1d3531] outline-none transition-all uppercase placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Separador elegante */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#7ba696]/10"></span></div>
          </div>

          {/* Botones de acción centrados y proporcionales */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <button 
              type="button"
              className="flex items-center gap-2 text-sm font-bold text-[#7ba696] hover:text-[#1d3531] transition-colors order-2 md:order-1"
            >
              <ArrowLeft size={16} /> Volver al panel
            </button>

            <button 
              type="submit"
              disabled={loading}
              className="w-full md:w-auto px-10 py-4 bg-[#1d3531] text-white font-bold rounded-2xl hover:bg-[#2d5a50] shadow-[0_10px_20px_rgba(29,53,49,0.2)] flex items-center justify-center gap-3 disabled:opacity-70 transition-all active:scale-95 order-1 md:order-2"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Save size={20} />
              )}
              {loading ? 'Sincronizando...' : 'Guardar Perfil'}
            </button>
          </div>

        </form>
      </div>
      
      {/* Footer sutil fuera de la tarjeta */}
      <p className="mt-8 text-[#7ba696] text-xs font-bold tracking-[0.2em] uppercase">
        UniMove &copy; 2026 • Campus Mobility
      </p>
    </div>
  );
};

export default UpdateProfile;