"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

export default function Map() {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return (
            <div className="w-full h-[400px] bg-muted/20 animate-pulse rounded-lg flex items-center justify-center">
                Loading Map...
            </div>
        );
    }

    // Coordinates for a central point (postal unit example) from prompt: 106.0981, 11.3135 (TTVH001)
    // [Lat, Lng] -> Prompt says: bcvh840100: [106.2333, 11.3167] which is Lng, Lat in GeoJSON/PostGIS usually, but Leaflet takes Lat, Lng.
    // Prompt: "postal_units": { "ttvh001": [106.0981, 11.3135] ... }
    // Assuming these are [Lng, Lat] format standard for GIS data in JSON. Leaflet wants [Lat, Lng].
    // let's use [11.3135, 106.0981] for TTVH.

    return (
        <MapContainer
            center={[11.3135, 106.0981]}
            zoom={10}
            scrollWheelZoom={false}
            className="w-full h-[400px] rounded-lg z-0 relative"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[11.3135, 106.0981]} icon={icon}>
                <Popup>
                    TTVH Center <br /> Postal Operations.
                </Popup>
            </Marker>
            {/* Example BCVH Marker */}
            <Marker position={[11.3167, 106.2333]} icon={icon}>
                <Popup>BCVH 840100</Popup>
            </Marker>
        </MapContainer>
    );
}
