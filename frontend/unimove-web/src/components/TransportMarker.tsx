import {Marker, Popup} from 'react-leaflet';
import {divIcon} from 'leaflet';
import { useState } from 'react';

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
    return (
        <Marker 
            position={position} 
            icon={createTransportIcon(type)}>
                <Popup>
                    <span><strong>{name}</strong></span>
                </Popup>
        </Marker>
    )
}

