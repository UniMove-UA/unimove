import React, { useState, useEffect } from "react";
import Page from "../components/Page";
import { useNavigate } from "react-router-dom";

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
        
        try {
            const response = await fetch("/api/travels", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                navigate("/travels/me"); // Redirige a "Mis Viajes" tras éxito
            } else {
                const data = await response.json();
                setError(data.message || "Error al publicar");
            }
        } catch (err) {
            setError("Error de conexión");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="publish-container">
            <h1>Publicar nuevo trayecto</h1>
            {vehicles.length === 0 ? (
                <p>Necesitas registrar un vehículo primero para poder compartir coche.</p>
            ) : (
                <form onSubmit={handleSubmit}>
                    {error && <div className="error">{error}</div>}
                    
                    <input type="text" placeholder="Origen" required 
                        onChange={e => setFormData({...formData, origin: e.target.value})} />
                    
                    <button type="button" onClick={handleGetLocation}>
                        📍 Obtener coordenadas actuales
                    </button>

                    <input type="text" placeholder="Destino" required 
                        onChange={e => setFormData({...formData, destination: e.target.value})} />

                    <input type="datetime-local" required 
                        onChange={e => setFormData({...formData, departure_time: e.target.value})} />

                    <input type="number" placeholder="Asientos" min="1" required 
                        onChange={e => setFormData({...formData, available_seats: parseInt(e.target.value)})} />

                    <input type="number" placeholder="Precio (€)" step="0.01" required 
                        onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} />

                    <select value={formData.vehicle_id} required
                        onChange={e => setFormData({...formData, vehicle_id: e.target.value})}>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id}>{v.brand} {v.model} - {v.license_plate}</option>
                        ))}
                    </select>

                    <button type="submit" disabled={loading}>
                        {loading ? "Publicando..." : "Publicar Viaje"}
                    </button>
                </form>
            )}
        </div>
    );
}