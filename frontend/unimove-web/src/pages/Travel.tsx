import Page from "../components/Page";
import { useState, useEffect } from "react";
import "../styles/Travel.css";
import CarSharingWidget from "../components/CarSharingWidget.tsx";
import PublicTransportWidget from "../components/PublicTransportWidget.tsx";
import { useSearchParams } from 'react-router-dom';
import CampusMobilityWidget from "../components/CampusMobilityWidget.tsx";

export default function Travel() {
    const [searchParams] = useSearchParams();
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState(searchParams.get("destination") || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [carSharingTrips, setCarSharingTrips] = useState<Array<{
        id: number;
        profileImage: string;
        origin: string;
        destination: string;
        departureTime: string;
        fullName: string;
        username: string;
        price: number;
    }>>([]);
    const [campusVmps, setCampusVmps] = useState<Array<{
        id: number;
        type: 'scooter' | 'bike';
        location_name?: string | null;
        lat?: number | null;
        lon?: number | null;
        price_per_minute?: number | null;
        unlock_price?: number | null;
    }>>([]);

    const getCampusZone = (lat?: number | null, lon?: number | null) => {
        if (lat == null || lon == null) return 'Campus UA';
        if (lat >= 38.3855) return 'Zona Norte (Aulario II)';
        if (lat <= 38.3835) return 'Zona Sur (Aulario I)';
        if (lon <= -0.5155) return 'Zona Oeste (Biblioteca)';
        if (lon >= -0.5120) return 'Zona Este (Deportivas)';
        return 'Zona Central (Rectorado)';
    };

    useEffect(() => {
        const fetchVmps = async () => {
            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch('http://localhost:8000/api/vmps', {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    },
                    credentials: 'include',
                });

                if (!response.ok) {
                    throw new Error('No se pudieron cargar los VMPs');
                }

                const data = await response.json();
                setCampusVmps(data.vmps || []);
            } catch (err) {
                console.error(err);
            }
        };

        fetchVmps();
    }, []);

    const handleOriginClick = () => {
        if (!navigator.geolocation) {
            setError("La geolocalización no es compatible con tu navegador");
            return;
        }

        setLoading(true);
        setError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                // Formato: latitud, longitud (con 6 decimales)
                const coords = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                setOrigin(coords);
                setLoading(false);
            },
            (err) => {
                setLoading(false);
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        setError("Permiso de ubicación denegado. Por favor habilita la ubicación en tu navegador.");
                        break;
                    case err.POSITION_UNAVAILABLE:
                        setError("La información de ubicación no está disponible.");
                        break;
                    case err.TIMEOUT:
                        setError("Se agotó el tiempo para obtener la ubicación.");
                        break;
                    default:
                        setError("Ocurrió un error desconocido al obtener la ubicación.");
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5 minutos de caché
            }
        );
    };

    const fetchAllTravels = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('http://localhost:8000/api/travels/all', {
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                credentials: 'include',
            });

            if (!response.ok) {
                if (response.status === 401) {
                    setError('Debes iniciar sesión para ver viajes.');
                    setCarSharingTrips([]);
                    return;
                }
                throw new Error('No se pudieron cargar los viajes');
            }

            const data = await response.json();
            const mapped = (data || []).map((trip: any) => ({
                id: trip.id,
                profileImage: trip?.driver?.image ? `http://localhost:8000/storage/${trip.driver.image}` : "https://i.pravatar.cc/150?img=1",
                origin: trip.origin,
                destination: trip.destination,
                departureTime: trip.departure_time,
                fullName: trip?.driver?.name || 'Conductor',
                username: trip?.driver?.username || 'usuario',
                price: Number(trip.price ?? 0),
            }));

            setCarSharingTrips(mapped);
        } catch (err) {
            console.error(err);
            setError('No se pudieron cargar los viajes.');
        }
    };

    useEffect(() => {
        fetchAllTravels();
    }, []);

    const publicTransportTrips = [
        {
            id: 1,
            profileImage: "https://cdn-icons-png.flaticon.com/512/3063/3063823.png",
            origin: "Madrid Centro",
            destination: "Barcelona Sants",
            lineName: "AVE",
            departureTime: "12:30",
            type: "train"
        },
        {
            id: 2,
            profileImage: "https://cdn-icons-png.flaticon.com/512/3063/3063823.png",
            origin: "Valencia Norte",
            destination: "Alicante Terminal",
            lineName: "L24",
            departureTime: "14:45",
            type: "bus"
        },
        {
            id: 3,
            profileImage: "https://cdn-icons-png.flaticon.com/512/3063/3063823.png",
            origin: "Sevilla Plaza",
            destination: "Málaga Centro",
            lineName: "L1",
            departureTime: "16:00",
            type: "tram"
        }
    ];


    return (
        <Page name="viajes">
            <div style={{margin: "3% 20%"}}>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Elige tu origen"
                        className="search-input origin-input"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        onClick={handleOriginClick}
                        readOnly={!origin} // Solo editable si ya tiene coordenadas
                    />
                    <input
                        type="text"
                        placeholder="Elige destino"
                        className="search-input destination-input"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                    />
                </div>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {loading && (
                    <div className="loading-indicator">
                        Obteniendo tu ubicación...
                    </div>
                )}

                <h1 className="section-title">Encuentra viajes cerca de ti</h1>
                <div className="nearby-trips-container">
                    {carSharingTrips.length === 0 && !loading && (
                        <p style={{ padding: "1rem", color: "#666" }}>
                            No hay viajes cercanos disponibles ahora mismo.
                        </p>
                    )}
                    {carSharingTrips.map((trip) => (
                        <CarSharingWidget
                            key={trip.id}
                            id={trip.id}
                            price={trip.price}
                            profileImage={trip.profileImage}
                            origin={trip.origin}
                            destination={trip.destination}
                            departureTime={trip.departureTime}
                            fullName={trip.fullName}
                            username={trip.username}
                        />
                    ))}
                </div>

                <h1 className="section-title">Otros métodos de transporte</h1>
                <div className="transport-methods-grid">
                    <div className="transport-column">
                        <h2>Transporte público</h2>
                        {publicTransportTrips.filter(t => t.type == "bus" || t.type == "tram").map((trip) => (
                            <PublicTransportWidget
                                key={trip.id}
                                profileImage={trip.profileImage}
                                origin={trip.origin}
                                destination={trip.destination}
                                lineName={trip.lineName}
                                departureTime={trip.departureTime}
                                onClick={() => {}}
                            />
                        ))}
                    </div>
                    <div className="transport-column">
                        <h2>Tren</h2>
                        {publicTransportTrips.filter(t => t.type == "train").map((trip) => (
                            <PublicTransportWidget
                                key={trip.id}
                                profileImage={trip.profileImage}
                                origin={trip.origin}
                                destination={trip.destination}
                                lineName={trip.lineName}
                                departureTime={trip.departureTime}
                                onClick={() => {}}
                            />
                        ))}
                    </div>
                    <div className="transport-column">
                        <h2>Dentro del campus</h2>
                        {campusVmps.length === 0 && (
                            <p style={{ fontSize: "0.9rem", color: "#666", marginTop: "1rem" }}>
                                No hay VMPs disponibles ahora mismo.
                            </p>
                        )}
                        {campusVmps.map((vmp) => {
                            const pricePerMinute = Number(vmp.price_per_minute ?? 0);
                            const unlockPrice = Math.max(0.5, Number(vmp.unlock_price ?? 0));
                            const priceText = `${unlockPrice.toFixed(2)}€ desbloqueo · ${pricePerMinute.toFixed(2)}€/min`;
                            const locationName = vmp.location_name || getCampusZone(vmp.lat, vmp.lon);
                            return (
                                <CampusMobilityWidget
                                    key={vmp.id}
                                    id={vmp.id}
                                    type={vmp.type ?? 'scooter'}
                                    locationName={locationName}
                                    priceText={priceText}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </Page>
    );
}