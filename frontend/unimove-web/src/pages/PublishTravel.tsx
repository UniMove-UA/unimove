import React, { useState, useEffect } from "react";
import Page from "../components/Page";
import { useNavigate } from "react-router-dom";

// Estilos internos rápidos para que veas el cambio inmediatamente
const styles = {
    container: { maxWidth: '500px', margin: '40px auto', padding: '20px', backgroundColor: '#2d2d2d', borderRadius: '10px', color: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' },
    formGroup: { marginBottom: '15px', display: 'flex', flexDirection: 'column' as 'column' },
    label: { marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' },
    input: { padding: '10px', borderRadius: '5px', border: '1px solid #444', backgroundColor: '#1e1e1e', color: 'white' },
    button: { padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' as 'bold', marginTop: '10px' },
    locationBtn: { padding: '8px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '12px', marginBottom: '10px' }
};

export default function PublishTravel() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Estado para el formulario (debe coincidir con la validación de Laravel)
    const [formData, setFormData] = useState({
        vehicle_id: "",
        origin: "",
        destination: "",
        departure_time: "",
        available_seats: 1,
        price: 0,
        lat: 0,
        lon: 0
    });

    // Cargar vehículos al montar el componente
    useEffect(() => {
        // Busca el token donde lo guardes (usualmente localStorage)
        const token = localStorage.getItem('auth_token'); 

        fetch("http://127.0.0.1:8000/api/vehicles/me", {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })
        .then(res => {
            if (res.status === 401) {
                throw new Error("No estas autenticado");
            }
            return res.json();
        })
        .then(data => {
            // Solo si data es un array, lo guardamos
            if (Array.isArray(data)) {
                setVehicles(data);
                if (data.length > 0) {
                    setFormData(f => ({ ...f, vehicle_id: data[0].id }));
                }
            } else {
                console.error("La API no devolvió un array:", data);
                setVehicles([]); // Evitamos que sea un objeto
            }
        })
        .catch(err => {
            console.error("Error:", err);
            setVehicles([]); // Si hay error, nos aseguramos de que sea un array vacío
        });
    }, []);

    const handleGetLocation = () => {
        navigator.geolocation.getCurrentPosition((pos) => {
            setFormData({ ...formData, lat: pos.coords.latitude, lon: pos.coords.longitude });
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Es fundamental recuperar el token aquí también
        const token = localStorage.getItem('auth_token'); 

        try {
            // Usa la URL absoluta igual que en el useEffect para evitar fallos de ruta
            const response = await fetch("http://127.0.0.1:8000/api/travels", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}` // Sin esto, Laravel te dará 401 o error de conexión
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                // Si el backend responde 201 (Creado), vamos a mis viajes
                navigate("/travels/me"); 
            } else {
                const data = await response.json();
                // Esto mostrará errores de validación de Laravel (ej: fecha pasada)
                setError(data.message || "Error al publicar");
            }
        } catch (err) {
            // Este catch se activa si el servidor está apagado o la URL es errónea
            setError("Error de conexión con el servidor");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2 style={{ textAlign: 'center' }}>🚀 Publicar nuevo trayecto</h2>
            
            {vehicles.length === 0 ? (
                <p style={{ color: '#ff6b6b' }}>⚠️ Registra un vehículo en tu perfil primero.</p>
            ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
                    {error && <div style={{ color: '#ff6b6b', marginBottom: '10px' }}>{error}</div>}

                    <div style={styles.formGroup}>
                        <label style={styles.label}>📍 Origen</label>
                        <button type="button" onClick={handleGetLocation} style={styles.locationBtn}>
                            {formData.lat ? "✅ Ubicación obtenida" : "Obtener mi ubicación actual"}
                        </button>
                        <input 
                            style={styles.input} 
                            type="text" 
                            placeholder="Ej: Calle Mayor 10, Alicante" 
                            required 
                            onChange={e => setFormData({...formData, origin: e.target.value})} 
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>🏁 Destino</label>
                        <input 
                            style={styles.input} 
                            type="text" 
                            placeholder="Ej: Facultad de Ciencias, UA" 
                            required 
                            onChange={e => setFormData({...formData, destination: e.target.value})} 
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>📅 Fecha y Hora</label>
                            <input 
                                style={styles.input} 
                                type="datetime-local" 
                                required 
                                onChange={e => setFormData({...formData, departure_time: e.target.value})} 
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>🚗 Vehículo</label>
                            <select 
                                style={styles.input} 
                                value={formData.vehicle_id} 
                                required
                                onChange={e => setFormData({...formData, vehicle_id: e.target.value})}
                            >
                                {vehicles.map(v => (
                                    <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>💺 Plazas</label>
                            <input 
                                style={styles.input} 
                                type="number" 
                                min="1" 
                                required 
                                onChange={e => setFormData({...formData, available_seats: parseInt(e.target.value)})} 
                            />
                        </div>
                        <div style={styles.formGroup}>
                            <label style={styles.label}>💰 Precio (€)</label>
                            <input 
                                style={styles.input} 
                                type="number" 
                                step="0.01" 
                                required 
                                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} 
                            />
                        </div>
                    </div>

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? "Procesando..." : "Publicar Viaje"}
                    </button>
                </form>
            )}
        </div>
    );
}