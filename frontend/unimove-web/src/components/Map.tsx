import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/Map.css';
import TransportMarker from "./TransportMarker.tsx";
import VmpMarker from "./VmpMarker.tsx";
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from "react";
import { useMap } from 'react-leaflet';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import MarkerClusterGroup from 'react-leaflet-cluster';

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Marker {
    name: string;
    type: string;
    id: string;
    lat: number;
    lon: number;
}

interface VmpMarkerData {
    id: number | string;
    vmp_id?: number;
    name: string;
    code: string;
    type: 'scooter' | 'bike';
    lat: number;
    lon: number;
    location_name?: string | null;
    price_per_minute?: number | null;
    unlock_price?: number | null;
}

interface MapProps {
    center?: [number, number];
    zoom?: number;
}

function MapFetcher({ onFetch }: { onFetch: (bounds: L.LatLngBounds) => void }) {
    const map = useMap();

    useEffect(() => {
        onFetch(map.getBounds());
        const handleMoveEnd = () => {
            onFetch(map.getBounds());
        };
        map.on('moveend', handleMoveEnd);
        return () => {
            map.off('moveend', handleMoveEnd);
        };
    }, [map, onFetch]);

    return null;
}

export default function Map({ center = [38.385, -0.513], zoom = 16 }: MapProps) {
    const navigate = useNavigate();
    const [destination, setDestination] = useState<string>("");
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [vmpMarkers, setVmpMarkers] = useState<VmpMarkerData[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const token = localStorage.getItem('auth_token');


    const getCampusZone = (lat?: number | null, lon?: number | null) => {
        if (lat == null || lon == null) return 'Campus UA';
        if (lat >= 38.3855) return 'Zona Norte (Aulario II)';
        if (lat <= 38.3835) return 'Zona Sur (Aulario I)';
        if (lon <= -0.5155) return 'Zona Oeste (Biblioteca)';
        if (lon >= -0.5120) return 'Zona Este (Deportivas)';
        return 'Zona Central (Rectorado)';
    };

    const handleBoundsChange = useCallback(async (bounds: L.LatLngBounds) => {
        setLoading(true);
        try {
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();

            // Construir la URL con los parámetros correctos
            const from = `${sw.lat},${sw.lng}`;
            const to = `${ne.lat},${ne.lng}`;

            const response = await fetch(`http://localhost:8000/api/markers?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);

            if (!response.ok) throw new Error(`Error: ${response.status}`);

            const data = await response.json();
            const combined: Marker[] = [
                ...(data.stops || []),
                ...(data.travels || []),
            ];
            setMarkers(combined);
            setVmpMarkers(data.vmps || []);
        } catch (error) {
            console.error("Error fetching markers:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    return (
        <div id='map'>
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ width: '100%', height: '100%' }}
            >
                <MapFetcher onFetch={handleBoundsChange} />
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MarkerClusterGroup>
                    {markers.map(marker => (
                        <TransportMarker
                            key={marker.id}
                            type={marker.type}
                            position={[marker.lat, marker.lon]}
                            name={marker.name}
                            id={marker.id}
                        />
                    ))}

                    {vmpMarkers.map(vmp => (
                        <VmpMarker
                            key={`vmp-${vmp.id}`}
                            position={[vmp.lat, vmp.lon]}
                            name={vmp.name}
                            code={vmp.code}
                            id={vmp.vmp_id ?? (typeof vmp.id === 'string' ? Number(String(vmp.id).replace('vmp_', '')) : vmp.id)}
                            type={vmp.type}
                            locationName={vmp.location_name || getCampusZone(vmp.lat, vmp.lon)}
                            unlockPrice={vmp.unlock_price ?? null}
                            pricePerMinute={vmp.price_per_minute ?? null}
                        />
                    ))}
                </MarkerClusterGroup>

                {loading && (
                    <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000, background: 'white', padding: '5px', borderRadius: '4px' }}>
                        Cargando...
                    </div>
                )}

            </MapContainer>
            <div id='search_bar'>
                <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#adb5bd"><path d="M380-320q-109 0-184.5-75.5T120-580q0-109 75.5-184.5T380-840q109 0 184.5 75.5T640-580q0 44-14 83t-38 69l224 224q11 11 11 28t-11 28q-11 11-28 11t-28-11L532-372q-30 24-69 38t-83 14Zm0-80q75 0 127.5-52.5T560-580q0-75-52.5-127.5T380-760q-75 0-127.5 52.5T200-580q0 75 52.5 127.5T380-400Z" /></svg>
                <input type='search' placeholder='¿A dónde vas?'
                    onChange={(e) => { setDestination(e.target.value) }}
                    onKeyDown={(event) => {
                        if (event.key == 'Enter') {
                           navigate(token ? `/travel?destination=${destination}` : '/login')
                        }
                    }}></input>
            </div>

        </div>
    );
}