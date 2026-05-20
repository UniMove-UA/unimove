import "../styles/Schedule.css"
interface ScheduleProps {
    destination: string;
    hour: string;
    name: string;
    line: string; 
    onClick?: () => void;
}

export default function Schedule({destination, hour, name, line, onClick}: ScheduleProps) {
    return (
        <button
            className="schedule-button"
            onClick={onClick}
            aria-label={`Horario ${name} hacia ${destination} a las ${hour}`}
        >
            <div className="schedule-row-top">
                <span className="schedule-name">{name}</span>
                <span className="schedule-line-badge">{line}</span>
            </div>
            <div className="schedule-row-bottom">
                <span className="schedule-destination">{destination}</span>
                <span className="schedule-hour">{hour}</span>
            </div>
        </button>
    );
};
