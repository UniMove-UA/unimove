import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useNavigate } from 'react-router-dom';
import CampusMobilityWidget from './CampusMobilityWidget';

const createVmpIcon = (type: 'scooter' | 'bike') => {
    const icon = type === 'bike' ? '/bike.svg' : '/vmp_map.svg';
    return divIcon({
        className: 'transport-marker',
        html: `
            <div class='marker'>
                <img src='/location.svg' alt='marker' class='marker-base' />
                <img src='${icon}' alt='badge' width="15" height="15" class='marker-badge' />    
            </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 45],
        popupAnchor: [0, -45]
    });
};

const coerceIdToNumber = (value: unknown): number => {
    if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
    if (typeof value === 'string') {
        const asNumber = Number(value);
        if (Number.isFinite(asNumber)) return asNumber;
        const match = value.match(/\d+/);
        return match ? Number(match[0]) : 0;
    }
    return 0;
}

interface MarkerProps {
    position: [number, number];
    id?: number | string;
    name: string;
    code?: string;
    type?: 'scooter' | 'bike';
    locationName?: string | null;
    unlockPrice?: number | null;
    pricePerMinute?: number | null;
    variants?: Array<{
        id?: number | string;
        vmp_id?: number | string;
        code?: string;
        name?: string;
        type?: 'scooter' | 'bike';
        location_name?: string | null;
        unlock_price?: number | null;
        price_per_minute?: number | null;
    }>;
}
export default function VmpMarker({ position, id, name, type = 'scooter', locationName, unlockPrice, pricePerMinute, variants }: MarkerProps) {
    const navigate = useNavigate();

    const renderSingle = () => {
        const unlock = Math.max(0.5, Number(unlockPrice ?? 0));
        const perMinute = Number(pricePerMinute ?? 0);
        return (
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
        );
    }

    const renderVariants = () => {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {(variants || []).map((v) => (
                    <CampusMobilityWidget
                        key={`variant-${v.type ?? 'scooter'}-${v.vmp_id ?? v.id ?? v.code}`}
                        id={coerceIdToNumber(v.vmp_id ?? v.id)}
                        type={(v.type as 'scooter' | 'bike') || 'scooter'}
                        locationName={v.location_name ?? v.name ?? undefined}
                        priceText={v.unlock_price ? `${Number(v.unlock_price).toFixed(2)}€` : v.price_per_minute ? `${Number(v.price_per_minute).toFixed(2)}€/min` : 'Precio no disponible'}
                    />
                ))}
            </div>
        );
    }

    // choose icon type for marker: prefer scooter if any variant is scooter
    const markerType = (variants && variants.some(v => v.type === 'scooter')) ? 'scooter' : (type || 'scooter');

    return (
        <Marker
            position={position}
            icon={createVmpIcon(markerType)}
        >
            <Popup>
                {variants && variants.length > 0 ? renderVariants() : renderSingle()}
            </Popup>
        </Marker>
    );
}
