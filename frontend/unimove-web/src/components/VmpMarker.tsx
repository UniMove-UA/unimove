import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useNavigate } from 'react-router-dom';

const createVmpIcon = (type: 'scooter' | 'bike') => {
    const icon = type === 'bike' ? 'bike.svg' : 'vmp_map.svg';
    return divIcon({
        className: 'transport-marker',
        html: `
            <div class='marker'>
                <img src='location.svg' alt='marker' class='marker-base' />
                <img src='${icon}' alt='badge' width="15" height="15" class='marker-badge' />    
            </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 45],
        popupAnchor: [0, -45]
    });
};

interface MarkerProps {
    position: [number, number];
    id: number;
    name: string;
    code: string;
    type: 'scooter' | 'bike';
    locationName?: string | null;
    unlockPrice?: number | null;
    pricePerMinute?: number | null;
}

export default function VmpMarker({ position, id, name, code, type, locationName, unlockPrice, pricePerMinute }: MarkerProps) {
    const navigate = useNavigate();
    const unlock = Math.max(0.5, Number(unlockPrice ?? 0));
    const perMinute = Number(pricePerMinute ?? 0);

    return (
        <Marker
            position={position}
            icon={createVmpIcon(type)}
        >
            <Popup>
                <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "1rem", display: "block", marginBottom: "5px" }}><strong>{name}</strong></span>
                    <span style={{ fontSize: "0.85rem", display: "block", marginBottom: "6px", color: "#666" }}>
                        Disponible en: {locationName || 'Campus UA'}
                    </span>
                    <span style={{ fontSize: "0.85rem", display: "block", marginBottom: "8px", color: "#666" }}>
                        {unlock.toFixed(2)}€ desbloqueo · {perMinute.toFixed(2)}€/min
                    </span>
                    <button 
                        style={{
                            backgroundColor: "#42b883",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            fontWeight: "bold",
                            marginTop: "5px"
                        }}
                        onClick={() => navigate(`/checkout?type=vmp&id=${id}`)}
                    >
                        Reservar
                    </button>
                </div>
            </Popup>
        </Marker>
    );
}
