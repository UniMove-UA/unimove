import "../styles/Travel.css"
interface CarSharingWidgetProps {
    profileImage: string;
    origin: string;
    destination: string;
    departureTime: string; // Formato HH:mm
    fullName: string;
    username: string;
    onClick?: () => void;
}

export default function CarSharingWidget({profileImage, origin, destination, departureTime, fullName, username, onClick}: CarSharingWidgetProps) {
    return (
        <button
            className="car-sharing-widget"
            onClick={onClick}
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
            </div>
        </button>
    );
};
