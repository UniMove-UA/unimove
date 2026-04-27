import {Marker, Popup} from 'react-leaflet';
import {divIcon} from 'leaflet';
import Schedule from "./Schedule.tsx";
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

interface MarkerProps {
    type: string;
    position: [number, number];
    name: string;
}

export default function TransportMarker({type, position, name}: MarkerProps) {

    const schedules = [
        {
            id: 1,
            name: "EXPRESO MATUTINO",
            line: "L1",
            destination: "Campus Central",
            hour: "08:30"
        },
        {
            id: 2,
            name: "SERVICIO UNIVERSITARIO",
            line: "AVE",
            destination: "Estación Norte",
            hour: "09:15"
        },
        {
            id: 3,
            name: "CONEXIÓN CAMPUS",
            line: "L24",
            destination: "Biblioteca",
            hour: "10:00"
        },
        {
            id: 4,
            name: "SERVICIO VESPERTINO",
            line: "L2",
            destination: "Residencia Estudiantes",
            hour: "18:45"
        }
    ];

    return (
        <Marker 
            position={position} 
            icon={createTransportIcon(type)}>
                <Popup>
                    <span style={{fontSize: "1rem"}}><strong>{name}</strong></span>
                    <div>
                        {
                            schedules.map(schedule =>
                                <Schedule
                                    name={schedule.name}
                                    hour={schedule.hour}
                                    line={schedule.line}
                                    destination={schedule.destination}
                                    onClick={() => {}} />
                            )
                        }
                    </div>
                </Popup>
        </Marker>
    )
}

