import "../styles/Travel.css";
import { useNavigate } from 'react-router-dom';

interface CampusMobilityWidgetProps {
    id: number;
    type: 'scooter' | 'bike';
    locationName?: string | null;
    priceText: string;
}

export default function CampusMobilityWidget({ id, type, locationName, priceText }: CampusMobilityWidgetProps) {
    const navigate = useNavigate();

    const icon = type === 'bike' ? 'bike.svg' : 'vmp.svg';
    const title = type === 'bike' ? 'Bicicleta disponible' : 'Patinete disponible';

    return (
        <button
            className="car-sharing-widget"
            onClick={() => navigate(`/checkout?type=vmp&id=${id}`)}
            aria-label={title}
        >
            <div className="widget-profile">
                <img
                    src={icon}
                    alt={type === 'bike' ? 'Bicicleta' : 'Patinete'}
                    className="profile-image"
                />
            </div>

            <div className="widget-content">
                <div className="route-info">
                    <span className="route-text">{title}</span>
                </div>

                <div className="driver-info">
                    <span className="driver-name">Disponible en: {locationName || 'Ubicación no disponible'}</span>
                </div>

                <div className="time-info">
                    <span className="departure-time">{priceText}</span>
                </div>
            </div>
        </button>
    );
}
