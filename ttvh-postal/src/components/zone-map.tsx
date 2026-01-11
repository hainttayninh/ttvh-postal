"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, Popup, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet generic icon
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface ZoneMapProps {
    zones: {
        id: string;
        name: string;
        color: string;
        points: [number, number][]; // Array of [lat, lng]
    }[];
    tasks: {
        id: string;
        lat: number;
        lng: number;
        title: string;
    }[];
}

export default function ZoneMap({ zones, tasks }: ZoneMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="w-full h-full bg-muted/20 animate-pulse flex items-center justify-center">
                Loading Zones...
            </div>
        );
    }

    // Center on TTVH
    const center: [number, number] = [11.3135, 106.0981];

    return (
        <MapContainer
            center={center}
            zoom={14}
            scrollWheelZoom={true}
            className="w-full h-full rounded-lg z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Draw Zones */}
            {zones.map((zone) => (
                <Polygon
                    key={zone.id}
                    positions={zone.points}
                    pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.2 }}
                >
                    <Popup>{zone.name}</Popup>
                </Polygon>
            ))}

            {/* Draw Task Markers */}
            {tasks.map((task) => (
                <Marker key={task.id} position={[task.lat, task.lng]} icon={icon}>
                    <Popup>{task.title}</Popup>
                </Marker>
            ))}

        </MapContainer>
    );
}
