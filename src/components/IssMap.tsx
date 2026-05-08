import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TrackingData } from '../hooks/useIssTracking';

const customIcon = new L.Icon({
    iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -25]
});

// Component to dynamically update map center
const MapUpdater: React.FC<{center: [number, number]}> = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
};

interface IssMapProps {
    positions: TrackingData[];
}

export const IssMap: React.FC<IssMapProps> = ({ positions }) => {
    if (positions.length === 0) return <div className="h-full w-full flex items-center justify-center text-slate-400">Acquiring signal...</div>;

    const latest = positions[positions.length - 1];
    const pathCoordinates = positions.map(pos => [pos.lat, pos.lon] as [number, number]);

    return (
        <MapContainer 
            center={[latest.lat, latest.lon]} 
            zoom={3} 
            className="w-full h-full rounded-2xl z-0"
            zoomControl={true}
        >
            {/* Dark themed map tiles */}
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            
            <Polyline positions={pathCoordinates} color="#4f46e5" weight={3} dashArray="5, 10" opacity={0.6} />
            
            <Marker position={[latest.lat, latest.lon]} icon={customIcon}>
                <Popup className="glassmorphism-dark">
                    <div className="font-mono text-sm space-y-1">
                        <p className="font-bold text-indigo-400 mb-2 font-sans border-b border-white/10 pb-1">ISS Live Coordinates</p>
                        <p>LAT: <span className="text-white">{latest.lat.toFixed(4)}°</span></p>
                        <p>LNG: <span className="text-white">{latest.lon.toFixed(4)}°</span></p>
                        <p>SPEED: <span className="text-white">{latest.speed.toFixed(0)} km/h</span></p>
                        <p className="text-xs text-slate-400 pt-2">
                            {new Date(latest.timestamp).toLocaleTimeString()}
                        </p>
                    </div>
                </Popup>
            </Marker>

            <MapUpdater center={[latest.lat, latest.lon]} />
        </MapContainer>
    );
};
