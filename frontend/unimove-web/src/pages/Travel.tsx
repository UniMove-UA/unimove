import Page from "../components/Page";
import { useState } from "react";
import "../styles/Travel.css";
import CarSharingWidget from "../components/CarSharingWidget.tsx";
import PublicTransportWidget from "../components/PublicTransportWidget.tsx";
import { useSearchParams } from 'react-router-dom';

interface Trip {
    type: string;
    id: string;
    profileImage: string;
    origin: string;
    destination: string;
    lineName: string;
    departureTime: string;
    fullName: string;
    username: string;
}

function getTransportType(stopId: string): string {
    if (stopId.startsWith('tram_')) {
        return 'tram';
    }
    if (stopId.startsWith('vec_')) {
        return 'bus';
    }
    if (stopId.startsWith('renfe_')) {
        return 'train';
    }
    if (stopId.startsWith('int_')) {
        return 'bus';
    }
    return 'bus';
}

const getTransportIcon = (type: string) => {
    switch(type) {
        case 'train': return '/tren.png';
        case 'tram': return '/tram.png';
        case 'bus': return '/autobus.png';
        default: return '/autobus.png';
    }
}

export default function Travel() {
    const [searchParams] = useSearchParams();

    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState(searchParams.get("destination") || "");

    const [publicTransportTrips, setPublicTransportTrips] = useState<Trip[]>([]);
    const [carSharingTrips, setCarSharingTrips] = useState<Trip[]>([]);

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const fetchTrips = async () => {
        if (!origin || !destination) {
            setApiError("Por favor, introduce tanto un origen como un destino.");
            return;
        }

        setFetchLoading(true);
        setApiError(null);

        try {
            const [latStr, lonStr] = origin.split(',').map(s => s.trim());
            const lat = parseFloat(latStr);
            const lon = parseFloat(lonStr);
            const token = localStorage.getItem('auth_token');

            if (isNaN(lat) || isNaN(lon)) {
                throw new Error("Formato de coordenadas inválido");
            }

            const routeRes = await fetch(`/api/route?from=${lat},${lon}&to=${encodeURIComponent(destination)}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (!routeRes.ok) {
                throw new Error(`Error en carsharing: ${routeRes.statusText}`);
            }
            const routeData = await routeRes.json();
            const mappedRouteData = routeData.map((trip: any) => ({
                ...trip,
                fullName: trip.driver?.name || '',
                username: trip.driver?.username || '',
                profileImage: trip.driver?.image || '',
                departureTime: trip.departure_time,
            }));
            setCarSharingTrips(mappedRouteData);

            const stopsRes = await fetch(`/api/stops/near?lat=${lat}&lon=${lon}`);
            const stopsData = await stopsRes.json();

            const schedules: Trip[] = [];
            for (const stop of stopsData) {
                const schedRes = await fetch(`/api/schedule?id=${stop.stop_id}`);
                const schedData = await schedRes.json();
                if (Array.isArray(schedData)) {
                    for (const sched of schedData) {
                        schedules.push({
                            id: `${stop.stop_id}_${sched.route_id}`,
                            type: getTransportType(stop.stop_id),
                            origin: stop.stop_name,
                            destination: sched.headsign || '',
                            lineName: sched.route_name,
                            departureTime: sched.departure_time,
                            profileImage: '',
                            fullName: '',
                            username: '',
                        });
                    }
                }
            }
            setPublicTransportTrips(schedules);

        } catch (err) {
            console.error(err);
            setApiError(err instanceof Error ? err.message : "Error desconocido al obtener los viajes");
        } finally {
            setFetchLoading(false);
        }
    };

    const handleOriginClick = () => {
        if (!navigator.geolocation) {
            setError("La geolocalización no es compatible con tu navegador");
            return;
        }

        setLoading(true);
        setError(null);
        setApiError(null);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
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
                maximumAge: 300000
            }
        );
    };

    const handleSearch = () => {
        if (!origin || !destination) {
            setApiError("Por favor, introduce tanto un origen como un destino.");
            return;
        }
        fetchTrips();
    };

    return (
        <Page name="viajes">
            <div style={{margin: "3% 20%"}}>
                <div className="search-container" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Elige tu origen"
                        className="search-input origin-input"
                        value={origin}
                        onChange={(e) => setOrigin(e.target.value)}
                        onClick={handleOriginClick}
                        readOnly={false}
                        style={{ flex: 1 }}
                    />
                    <input
                        type="text"
                        placeholder="Elige destino"
                        className="search-input destination-input"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                        style={{ flex: 1 }}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={fetchLoading || loading}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: fetchLoading || loading ? '#ccc' : '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: fetchLoading || loading ? 'not-allowed' : 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        {fetchLoading ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}
                {loading && <div className="loading-indicator">Obteniendo tu ubicación...</div>}
                {fetchLoading && <div className="loading-indicator">Buscando viajes disponibles...</div>}
                {apiError && <div className="error-message" style={{color: '#d32f2f'}}>{apiError}</div>}

                <h1 className="section-title">Encuentra viajes cerca de ti</h1>
                <div className="nearby-trips-container">
                    {carSharingTrips.length === 0 && !fetchLoading && !apiError ? (
                        <p>No se encontraron viajes de carsharing disponibles. Introduce un origen y destino y pulsa Buscar.</p>
                    ) : (
                        carSharingTrips.map((trip: Trip) => (
                            <CarSharingWidget
                                key={trip.id}
                                profileImage={trip.profileImage ? `http://localhost:8000/storage/${trip.profileImage}` : "/avatar.png"}
                                origin={trip.origin}
                                destination={trip.destination}
                                departureTime={trip.departureTime}
                                fullName={trip.fullName}
                                username={trip.username}
                                onClick={() => {}}
                            />
                        ))
                    )}
                </div>

                <h1 className="section-title">Otros métodos de transporte</h1>
                <div className="transport-methods-grid">
                    <div className="transport-column">
                        <h2>Transporte público</h2>
                        {publicTransportTrips.filter(t => t.type === "bus" || t.type === "tram").length === 0 && !fetchLoading ? (
                            <p>No hay transporte público cercano.</p>
                        ) : (
                            publicTransportTrips
                                .filter(t => t.type === "bus" || t.type === "tram")
                                .map((trip) => (
                                    <PublicTransportWidget
                                        key={trip.id}
                                        profileImage={getTransportIcon(trip.type)}
                                        origin={trip.origin}
                                        destination={trip.destination}
                                        lineName={trip.lineName}
                                        departureTime={trip.departureTime}
                                        onClick={() => {}}
                                    />
                                ))
                        )}
                    </div>
                    <div className="transport-column">
                        <h2>Tren</h2>
                        {publicTransportTrips.filter(t => t.type === "train").length === 0 && !fetchLoading ? (
                            <p>No hay trenes cercanos.</p>
                        ) : (
                            publicTransportTrips
                                .filter(t => t.type === "train")
                                .map((trip) => (
                                    <PublicTransportWidget
                                        key={trip.id}
                                        profileImage={getTransportIcon(trip.type)}
                                        origin={trip.origin}
                                        destination={trip.destination}
                                        lineName={trip.lineName}
                                        departureTime={trip.departureTime}
                                        onClick={() => {}}
                                    />
                                ))
                        )}
                    </div>
                    <div className="transport-column">
                        <h2>Dentro del campus</h2>
                        {publicTransportTrips.filter(t => t.type === "campus").length === 0 && !fetchLoading ? (
                            <p>No hay transporte dentro del campus cercano.</p>
                        ) : (
                            publicTransportTrips
                                .filter(t => t.type === "campus")
                                .map((trip) => (
                                    <PublicTransportWidget
                                        key={trip.id}
                                        profileImage={getTransportIcon(trip.type)}
                                        origin={trip.origin}
                                        destination={trip.destination}
                                        lineName={trip.lineName}
                                        departureTime={trip.departureTime}
                                        onClick={() => {}}
                                    />
                                ))
                        )}
                    </div>
                </div>
            </div>
        </Page>
    );
}