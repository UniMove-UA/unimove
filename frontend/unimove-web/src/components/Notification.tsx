import "../styles/Notifications.css"
interface NotificationProps {
    id: string | number;
    message: string;
    timestamp?: string;
    onMarkAsRead?: (id: string | number) => void;
    isNew?: boolean;
}

export default function Notification ({id, message, timestamp, onMarkAsRead, isNew = false}: NotificationProps) {
    const handleClick = () => {
        if (onMarkAsRead) {
            onMarkAsRead(id);
        }
    };

    return (
        <div
            className={`notification-item ${isNew ? 'new' : ''}`}
            data-id={id}
        >
            <div className="notification-content">
                <p className="notification-message">{message}</p>
                {timestamp && <span className="notification-time">{timestamp}</span>}
            </div>

            <button
                className="mark-read-btn"
                onClick={handleClick}
                aria-label={`Marcar notificación ${id} como leída`}
            >
                Marcar como leído
            </button>
        </div>
    );
};

