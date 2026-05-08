import { Marker, Popup } from 'react-leaflet';
import { divIcon } from 'leaflet';
import { useNavigate } from 'react-router-dom';

const createVmpIcon = () => {
    return divIcon({
        className: 'transport-marker',
        html: `
            <div class='marker'>
                <img src='location.svg' alt='marker' class='marker-base' />
                <img src='vmp.svg' alt='badge' width="15" height="15" class='marker-badge' />    
            </div>
        `,
        iconSize: [40, 50],
        iconAnchor: [20, 45],
        popupAnchor: [0, -45]
    });
};

interface MarkerProps {
    position: [number, number];
    name: string;
    code: string;
    onRent?: (code: string) => void;
}

export default function VmpMarker({ position, name, code, onRent }: MarkerProps) {
    const navigate = useNavigate();

    return (
        <Marker
            position={position}
            icon={createVmpIcon()}
        >
            <Popup>
                <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "1rem", display: "block", marginBottom: "5px" }}><strong>{name}</strong></span>
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
                        onClick={() => {
                            if (onRent) {
                                onRent(code);
                            } else {
                                navigate('/rentvmp');
                            }
                        }}
                    >
                        Alquilar
                    </button>
                </div>
            </Popup>
        </Marker>
    );
}
