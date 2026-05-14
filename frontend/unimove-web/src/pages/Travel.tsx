import Page from "../components/Page";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";
import "../styles/Travel.css";
import CarSharingWidget from "../components/CarSharingWidget.tsx";
import PublicTransportWidget from "../components/PublicTransportWidget.tsx";
import { useSearchParams } from 'react-router-dom';
import CampusMobilityWidget from "../components/CampusMobilityWidget.tsx";

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
    status?: string;
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
    switch (type) {
        case 'train': return '/tren.png';
        case 'tram': return '/tram.png';
        case 'bus': return '/autobus.png';
        default: return '/autobus.png';
    }
}

export default function Travel() {
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState(searchParams.get("destination") || "");

    const [publicTransportTrips, setPublicTransportTrips] = useState<Trip[]>([]);
    const [myTrips, setMyTrips] = useState<Trip[]>([]);

    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [apiError, setApiError] = useState<string | null>(null);

    const [carSharingTrips, setCarSharingTrips] = useState<Array<{
        id: number;
        profileImage: string;
        origin: string;
        destination: string;
        departureTime: string;
        fullName: string;
        username: string;
        price: number;
        available_seats: number;
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

    const token = localStorage.getItem("auth_token");

    const [myBookingTravelIds, setMyBookingTravelIds] = useState<number[]>([])
    const [updatingTravelId, setUpdatingTravelId] = useState<number | null>(null)

    const handleUpdateTravelStatus = async (travelId: number, status: 'completed' | 'cancelled') => {
        setUpdatingTravelId(travelId)
        try {
            const url = status === 'completed'
                ? `http://localhost:8000/api/travels/${travelId}/complete`
                : `http://localhost:8000/api/travels/${travelId}`

            const res = await fetch(url, {
                method: status === 'completed' ? 'PUT' : 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                }
            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.message || 'No se pudo actualizar el viaje.')
                return
            }

            setMyTrips(prev => prev.map(t =>
                Number(t.id) === travelId ? { ...t, status } : t
            ))
        } catch {
            alert('No se pudo actualizar el viaje.')
        } finally {
            setUpdatingTravelId(null)
        }
    }

    useEffect(() => {
        const fetchMyBookings = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/bookings/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                })
                if (!res.ok) return
                const data = await res.json()
                setMyBookingTravelIds(
                    data
                        .filter((b: any) => b.status === 'confirmed')
                        .map((b: any) => b.travel_id)
                )
            } catch (err) {
                console.error(err)
            }
        }
        fetchMyBookings()
    }, [])

    useEffect(() => {
        const fetchMyTrips = async () => {
            try {
                const res = await fetch(`/api/travels/me`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                });
                if (!res.ok) throw new Error(`Error: ${res.statusText}`);
                const data = await res.json();
                const mapped = data.map((trip: any) => ({
                    ...trip,
                    fullName: trip.driver?.name || '',
                    username: trip.driver?.username || '',
                    profileImage: trip.driver?.image || '',
                    departureTime: trip.departure_time,
                }));
                setMyTrips(mapped);
            } catch (err) {
                console.error("Error cargando mis viajes:", err);
            }
        };
        fetchMyTrips();
    }, []);

    const fetchTrips = async () => {
        if (!origin || !destination) {
            setApiError("Por favor, introduce tanto un origen como un destino.");
            return;
        }

        setFetchLoading(true);
        setHasSearched(true);
        setCampusVmps([]);
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
                available_seats: trip.available_seats,
            }));
            setCarSharingTrips(mappedRouteData);

            try {
                const delta = 0.003
                const fromBox = `${lat - delta},${lon - delta}`
                const toBox = `${lat + delta},${lon + delta}`
                const markersRes = await fetch(`http://localhost:8000/api/markers?from=${encodeURIComponent(fromBox)}&to=${encodeURIComponent(toBox)}`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                    credentials: 'include',
                })
                if (markersRes.ok) {
                    const markersData = await markersRes.json()
                    setCampusVmps(markersData.vmps || [])
                } else {
                    setCampusVmps([])
                }
            } catch {
                setCampusVmps([])
            }

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
            <div style={{ margin: "3% 20%" }}>
                <div className="search-container">
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
                            padding: '12px 30px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
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
                {apiError && <div className="error-message" style={{ color: '#d32f2f' }}>{apiError}</div>}

                <h1 className="section-title">Encuentra viajes cerca de ti</h1>
                <div className="nearby-trips-container">
                    {carSharingTrips.length === 0 && !fetchLoading && !apiError ? (
                        <p>No se encontraron viajes de carsharing disponibles. Introduce un origen y destino y pulsa Buscar.</p>
                    ) : (
                        carSharingTrips.map((trip) => (
                            <CarSharingWidget
                                key={trip.id}
                                id={trip.id}
                                profileImage={trip.profileImage ? `http://localhost:8000/storage/${trip.profileImage}` : "/avatar.png"}
                                origin={trip.origin}
                                destination={trip.destination}
                                departureTime={trip.departureTime}
                                fullName={trip.fullName}
                                username={trip.username}
                                availableSeats={trip.available_seats}
                                price={trip.price}
                                clickable={trip.available_seats > 0 && !myBookingTravelIds.includes(trip.id)}
                                alreadyBooked={myBookingTravelIds.includes(trip.id)}
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
                        {publicTransportTrips.filter(t => t.type === "campus").length === 0 && campusVmps.length === 0 && !fetchLoading ? (
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
                        {hasSearched && !fetchLoading && campusVmps.length === 0 && (
                            <p>No hay patinetes disponibles cerca.</p>
                        )}
                        {hasSearched && campusVmps.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                                {campusVmps.map((v) => (
                                    <CampusMobilityWidget
                                        key={`campus-vmp-${v.id}`}
                                        id={typeof v.id === 'number' ? v.id : Number(v.id)}
                                        type={(v.type as 'scooter' | 'bike') || 'scooter'}
                                        locationName={v.location_name ?? undefined}
                                        priceText={v.unlock_price ? `${Number(v.unlock_price).toFixed(2)}€` : v.price_per_minute ? `${Number(v.price_per_minute).toFixed(2)}€/min` : 'Precio no disponible'}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <h1 className="section-title">Mis viajes</h1>
                <div className="my-trips-container" style={{ marginBottom: '20px' }}>
                    <div className="trips-row" style={{ display: 'flex', flexDirection: 'column', gap: '15px', paddingBottom: '10px' }}>
                        {myTrips.length === 0 && <p>No tienes viajes publicados.</p>}
                        {myTrips.map((trip: Trip) => (
                            <div key={trip.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <CarSharingWidget
                                    id={Number(trip.id)}
                                    profileImage={trip.profileImage ? `http://localhost:8000/storage/${trip.profileImage}` : "/avatar.png"}
                                    origin={trip.origin}
                                    destination={trip.destination}
                                    departureTime={trip.departureTime}
                                    fullName={trip.fullName}
                                    username={trip.username}
                                    clickable={false}
                                />
                                {trip.status === 'active' && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                                        <button
                                            onClick={() => handleUpdateTravelStatus(Number(trip.id), 'completed')}
                                            disabled={updatingTravelId === Number(trip.id)}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#28a745',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontWeight: 500
                                            }}
                                        >
                                            Completar
                                        </button>
                                        <button
                                            onClick={() => handleUpdateTravelStatus(Number(trip.id), 'cancelled')}
                                            disabled={updatingTravelId === Number(trip.id)}
                                            style={{
                                                padding: '6px 12px',
                                                backgroundColor: '#dc2626',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '13px',
                                                fontWeight: 500
                                            }}
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                )}
                                {trip.status !== 'active' && (
                                    <span style={{
                                        fontSize: 13,
                                        fontWeight: 500,
                                        color: trip.status === 'completed' ? '#28a745' : '#dc2626',
                                        flexShrink: 0
                                    }}>
                                        {trip.status === 'completed' ? 'Completado' : 'Cancelado'}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button
                        onClick={() => { navigate('/travels/publish') }}
                        style={{
                            padding: '12px 30px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '16px',
                            fontWeight: 'bold'
                        }}
                    >
                        Nuevo viaje
                    </button>
                </div>
            </div>
        </Page>
    );
}