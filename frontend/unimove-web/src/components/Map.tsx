import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Map.css';
import TransportMarker from "./TransportMarker.tsx";

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});


interface MapProps {
    center?: [number, number];
    zoom?: number;
}

export default function Map({ center = [38.385, -0.513], zoom = 16 }: MapProps) {
    return (
        <div id='map'>
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <TransportMarker position={[38.385, -0.513]} type={'bus'} />
                <TransportMarker position={[38.3865, -0.511]} type={'train'} />
                <TransportMarker position={[38.3855, -0.516]} type={'car'} />

                <TransportMarker position={[38.3825, -0.5285]} type={'train'} />

            </MapContainer>
        </div>
    );
}