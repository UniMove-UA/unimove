import "../styles/Travel.css";

interface PublicTransportWidgetProps {
    profileImage: string;
    origin: string;
    destination: string;
    lineName: string;
    departureTime: string;
    onClick?: () => void;
}

export default function PublicTransportWidget({profileImage, origin, destination, lineName, departureTime, onClick}: PublicTransportWidgetProps) {
    return (
        <button
            className="public-transport-widget"
            onClick={onClick}
            aria-label={`Transporte público línea ${lineName} desde ${origin} a ${destination}`}
        >
            <div className="widget-profile">
                <img
                    src={profileImage}
                    alt={`Icono de transporte público`}
                    className="profile-image"
                />
            </div>

            <div className="widget-content">
                <div className="route-info">
                    <span className="route-text">{origin} → {destination}</span>
                    <span className="line-badge">{lineName}</span>
                </div>

                <div className="time-info">
                    <span className="departure-time">{departureTime}</span>
                </div>
            </div>
        </button>
    );
};
