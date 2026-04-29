import Page from "../components/Page";
import { useState } from "react";
import "../styles/Travel.css";
import CarSharingWidget from "../components/CarSharingWidget.tsx";
import PublicTransportWidget from "../components/PublicTransportWidget.tsx";
import { useSearchParams } from 'react-router-dom';

export default function Travel() {
    const [searchParams] = useSearchParams();
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState(searchParams.get("destination") || "");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

    const carSharingTrips = [
        {
            id: 1,
            profileImage: "https://i.pravatar.cc/150?img=1",
            origin: "Madrid Centro",
            destination: "Barcelona Sants",
            departureTime: "12:30",
            fullName: "María García",
            username: "mariagarcia"
        },
        {
            id: 2,
            profileImage: "https://i.pravatar.cc/150?img=2",
            origin: "Valencia Norte",
            destination: "Alicante Terminal",
            departureTime: "14:45",
            fullName: "Carlos Rodríguez",
            username: "carlosrod"
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
                    {carSharingTrips.map((trip) => (
                        <CarSharingWidget
                            key={trip.id}
                            profileImage={trip.profileImage}
                            origin={trip.origin}
                            destination={trip.destination}
                            departureTime={trip.departureTime}
                            fullName={trip.fullName}
                            username={trip.username}
                            onClick={() => {}}
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
                        {publicTransportTrips.filter(t => t.type == "campus").map((trip) => (
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
                </div>
            </div>
        </Page>
    );
}