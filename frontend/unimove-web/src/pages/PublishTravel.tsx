import React, { useState, useEffect } from "react";
import Page from "../components/Page";
import { useNavigate } from "react-router-dom";
import "../styles/PublishTravel.css";

export default function PublishTravel() {
    const navigate = useNavigate();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [locating, setLocating] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const [formData, setFormData] = useState({
        vehicle_id: "",
        origin: "",
        destination: "",
        departure_time: "",
        available_seats: 1,
        price: 0,
        lat: null as number | null,
        lon: null as number | null
    });

    useEffect(() => {
        const fetchVehicles = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch("http://127.0.0.1:8000/api/vehicles/me", {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const data = await response.json();
                if (Array.isArray(data) && data.length > 0) {
                    setVehicles(data);
                    // Aseguramos que el ID inicial sea un string válido
                    setFormData(f => ({ ...f, vehicle_id: data[0].id.toString() }));
                }
            } catch (err) {
                console.error("Error cargando vehículos:", err);
            } finally {
                setHasLoaded(true); // Carga completada
            }
        };
        fetchVehicles();
    }, []);

    // Lógica de plazas máximas blindada contra NaN
    const selectedVehicle = vehicles.find(v => v.id.toString() === formData.vehicle_id);
    const maxSeats = selectedVehicle && !isNaN(selectedVehicle.seats) ? (parseInt(selectedVehicle.seats) - 1) : 4;

    const handleGetLocation = () => {
        setLocating(true);

        if (errors.location) {
            setErrors(prev => {
                const { location, ...rest } = prev;
                return rest;
            });
        }
        
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setFormData({ ...formData, lat: pos.coords.latitude, lon: pos.coords.longitude });
                setErrors(prev => {
                    const { location, ...rest } = prev;
                    return rest;
                });
                setLocating(false);
            },
            () => {
                setErrors({ location: ["Activa el GPS para fijar el origen."] });
                setLocating(false);
            }
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});
        
        if (!formData.lat || !formData.lon) {
            setErrors({ location: ["Es obligatorio marcar tu ubicación en el mapa."] });
            return;
        }

        setLoading(true);
        const token = localStorage.getItem('auth_token');

        try {
            const response = await fetch("http://127.0.0.1:8000/api/travels", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                navigate("/travel");
            } else {
                setErrors(data.errors || { general: [data.message] });
            }
        } catch (err) {
            setErrors({ general: ["Error de conexión. Inténtalo de nuevo."] });
        } finally {
            setLoading(false);
        }
    };

    if (!hasLoaded) return null;

    return (
        <Page name="viajes">
            <div className="publish-layout">
                <div className="publish-card">
                    <header className="publish-header">
                        <h2>Nuevo Trayecto</h2>
                    </header>

                    <form onSubmit={handleSubmit} className="publish-form">
                        {vehicles.length === 0 ? (
                            <div className="error-alert">
                                Debes registrar un vehículo en tu perfil para poder publicar un viaje.
                            </div>
                        ) : (
                            <>
                                {/* Solo se muestra el resto del formulario si hay vehículos*/}
                                {(errors.general || errors.location) && (
                                    <div className="error-alert">
                                        {errors.general?.[0] || errors.location?.[0]}
                                    </div>
                                )}

                                <section className="form-section">
                                    <h3 className="section-subtitle">Ruta y Ubicación</h3>
                                    <div className="form-group">
                                        <label>Punto de encuentro</label>
                                        <div className="input-with-action">
                                            <input
                                                className="travel_input"
                                                type="text" 
                                                placeholder="Ej: Crevillente, Alicante"
                                                value={formData.origin}
                                                onChange={e => setFormData({...formData, origin: e.target.value})}
                                                required 
                                            />
                                            <button 
                                                type="button" 
                                                onClick={handleGetLocation}
                                                className={`location-btn ${formData.lat ? 'success' : ''}`}
                                            >
                                                {locating ? "..." : formData.lat ? "✓" : "📍"}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="form-group">
                                        <label>Destino final</label>
                                        <input
                                            className="travel_input"
                                            type="text" 
                                            placeholder="Ej: Universidad de Alicante (UA)"
                                            value={formData.destination}
                                            onChange={e => setFormData({...formData, destination: e.target.value})}
                                            required 
                                        />
                                    </div>
                                </section>

                                <section className="form-section grid-2">
                                    <div className="form-group">
                                        <label>Fecha salida</label>
                                        <input
                                            className="travel_input"
                                            type="datetime-local" 
                                            min={new Date().toISOString().slice(0, 16)}
                                            max="2027-12-31T23:59"
                                            value={formData.departure_time}
                                            onChange={e => setFormData({...formData, departure_time: e.target.value})}
                                            required 
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Vehículo</label>
                                        <select 
                                            value={formData.vehicle_id}
                                            onChange={e => setFormData({...formData, vehicle_id: e.target.value})}
                                        >
                                            {vehicles.map(v => (
                                                <option key={v.id} value={v.id.toString()}>{v.brand} {v.model} ({v.plate})</option>
                                            ))}
                                        </select>
                                    </div>
                                </section>

                                <section className="form-section grid-2">
                                    <div className="form-group">
                                        <label>Plazas (Máx: {maxSeats})</label>
                                        <input
                                            className="travel_input"
                                            type="number" 
                                            min="1" 
                                            max={maxSeats}
                                            value={formData.available_seats || ""}
                                            onChange={e => {
                                                const val = e.target.value === "" ? 0 : parseInt(e.target.value);
                                                setFormData({...formData, available_seats: Math.min(val, maxSeats)});
                                            }}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Precio por plaza (€)</label>
                                        <div className="price-input-wrapper">
                                            <input
                                                className="travel_input"
                                                type="number" 
                                                step="0.50" 
                                                min="0"
                                                placeholder="0.00"
                                                onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})}
                                                required
                                            />
                                        </div>
                                    </div>
                                </section>

                                <button type="submit" className="confirm-btn" disabled={loading}>
                                    {loading ? "PROCESANDO..." : "CONFIRMAR PUBLICACIÓN"}
                                </button>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </Page>
    );
}