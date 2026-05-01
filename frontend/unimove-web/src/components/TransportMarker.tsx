import {Marker, Popup} from 'react-leaflet';
import {divIcon} from 'leaflet';
import Schedule from "./Schedule.tsx";
import { useState } from 'react';
const createTransportIcon = (type: string) => {
    return divIcon({
        className: 'transport-marker',
        html: `
            <div class='marker'>
                <img src='location.svg' alt='marker' class='marker-base' />
                <img src=${type+'.svg'} alt='badge' width="15" height="15" class='marker-badge' />    
            </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 45],
        popupAnchor: [0, -45]
    });
};

interface ScheduleItem {
    route_id: string;
    route_name: string;
    headsign: string;
    departure_time: string;
    arrival_time: string;
}

interface MarkerProps {
    type: string;
    position: [number, number];
    name: string;
    id: string;
}

export default function TransportMarker({ type, position, name, id }: MarkerProps) {
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasLoaded, setHasLoaded] = useState(false);

    const handleMarkerClick = async () => {
        if (hasLoaded) return;

        setLoading(true);
        try {
            const response = await fetch(`http://localhost:8000/api/schedule?id=${id}`);
            if (response.ok) {
                const data = await response.json();
                setSchedules(data);
            }
            else {
                console.error("Error al cargar horarios:", response.statusText);
            }
        }
        catch (err) {
            console.error("Error de red al cargar horarios:", err);
        }
        finally {
            setLoading(false);
            setHasLoaded(true);
        }
    };

    return (
        <Marker
            position={position}
            icon={createTransportIcon(type)}
            eventHandlers={{
                click: handleMarkerClick
            }}
        >
            <Popup>
                <span style={{ fontSize: "1rem" }}><strong>{name}</strong></span>

                {loading && <p style={{ fontSize: "0.8rem", margin: "5px 0" }}>Cargando horarios...</p>}

                {!loading && schedules.length === 0 && !hasLoaded && (
                    <p style={{ fontSize: "0.8rem", color: "#666", margin: "5px 0" }}>
                        Haz clic en el marcador para ver horarios
                    </p>
                )}

                {!loading && schedules.length > 0 && (
                    <div style={{ marginTop: "5px" }}>
                        {schedules.map((schedule, index) => (
                            <Schedule
                                key={index}
                                name={schedule.route_name || "Ruta"}
                                hour={schedule.departure_time}
                                line={schedule.headsign || "Línea"}
                                destination={schedule.headsign || "Destino"}
                                onClick={() => {}}
                            />
                        ))}
                    </div>
                )}
            </Popup>
        </Marker>
    );
}

