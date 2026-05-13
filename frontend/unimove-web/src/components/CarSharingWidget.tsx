import "../styles/Travel.css"
import { useNavigate } from 'react-router-dom';

interface CarSharingWidgetProps {
    id?: number;
    price?: number;
    profileImage: string;
    origin: string;
    destination: string;
    departureTime: string;
    fullName: string;
    username: string;
    clickable?: boolean;
}

export default function CarSharingWidget({id, price, profileImage, origin, destination, departureTime, fullName, username, clickable = true}: CarSharingWidgetProps) {
    const navigate = useNavigate();

    const handleClick = () => {
        if (!clickable) return;
        if (id) {
            navigate(`/checkout?type=carpool&id=${id}`);
        } else {
            navigate('/checkout');
        }
    }

    return (
        <button
            className="car-sharing-widget"
            onClick={handleClick}
            disabled={!clickable}
            style={!clickable ? { cursor: 'default', opacity: 1 } : {}}
            aria-label={`Viaje compartido de ${fullName} desde ${origin} a ${destination}`}
        >
            <div className="widget-profile">
                <img
                    src={profileImage}
                    alt={`Foto de perfil de ${fullName}`}
                    className="profile-image"
                />
            </div>

            <div className="widget-content">
                <div className="route-info">
                    <span className="route-text">{origin} → {destination}</span>
                </div>

                <div className="time-info">
                    <span className="departure-time">{departureTime}</span>
                </div>

                <div className="driver-info">
                    <span className="driver-name">{fullName}</span>
                    <span className="driver-username">@{username}</span>
                </div>

                {price !== undefined && (
                    <div className="price-info">
                        <strong>{price}€</strong>
                    </div>
                )}
            </div>
        </button>
    );
};
