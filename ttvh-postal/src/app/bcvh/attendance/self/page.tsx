"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, MapPin, Camera, CheckCircle, AlertOctagon } from "lucide-react";
import { useGeolocated } from "react-geolocated";
import { calculateDistance, isWithinRange } from "@/utils/geolock";

export default function SelfAttendancePage() {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "locating" | "ready" | "success" | "blocked">("idle");
    const [photo, setPhoto] = useState<File | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [distance, setDistance] = useState<number | null>(null);
    const router = useRouter();
    const supabase = createClient();

    // Mock Office Coordinates (TTVH001: 11.3135, 106.0981)
    const TARGET_LAT = 11.3135;
    const TARGET_LNG = 106.0981;
    const ALLOWED_RADIUS = 10000; // Intentionally large (10km) for testing, prompt said 100m but user might be far. 
    // Let's stick to prompt instruction "±100m" but make it usable for demo if user is not there.
    // Actually, I should probably stick to 100m as per requirement "Geolock ±100m".
    // Note: If user is testing from home, they will be blocked. I will add a "Mock Location" note or use a larger radius for now if I can't override.
    // Requirement says "Geolock ±100m". I will implement STRICT 100m but maybe safeguard for demo.
    // I will implement 100m.
    const STRICT_RADIUS = 100;

    const { coords, isGeolocationAvailable, isGeolocationEnabled } =
        useGeolocated({
            positionOptions: {
                enableHighAccuracy: true,
            },
            userDecisionTimeout: 5000,
        });

    useEffect(() => {
        if (!isGeolocationAvailable) {
            setMessage("Your browser does not support Geolocation");
        } else if (!isGeolocationEnabled) {
            setMessage("Geolocation is not enabled");
        } else if (coords) {
            const dist = calculateDistance(coords.latitude, coords.longitude, TARGET_LAT, TARGET_LNG);
            setDistance(dist);

            if (dist <= STRICT_RADIUS) {
                setStatus("ready");
                setMessage(null);
            } else {
                setStatus("blocked");
                setMessage(`You are ${Math.round(dist)}m away from office. Must be < 100m.`);
            }
        } else {
            setStatus("locating");
        }
    }, [coords, isGeolocationAvailable, isGeolocationEnabled]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]);
        }
    };

    const handleCheckIn = async () => {
        if (!coords || !photo) {
            setMessage("Location and Photo are required.");
            return;
        }

        if (status === "blocked") {
            setMessage("Cannot check-in. You are too far.");
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            // 1. Upload Photo (Mock)
            const fileExt = photo.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const photoUrl = `https://mock.supabase.co/storage/v1/object/public/attendance/${fileName}`;

            // 2. Insert Attendance Record
            const { error: insertError } = await supabase
                .from("attendance")
                .insert({
                    employee_id: "user-id-placeholder",
                    bcvh_code: "bcvh-840100",
                    status: "present",
                    duration_hours: 0,
                    lat: coords.latitude,
                    lng: coords.longitude,
                    photo_url: photoUrl
                });

            if (insertError) throw insertError;

            setStatus("success");
            setMessage("Check-in Successful!");

            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);

        } catch (err: any) {
            setMessage(err.message || "Check-in failed");
        } finally {
            setLoading(false);
        }
    };

    if (status === "success") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-green-50">
                <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-green-700">Checked In!</h2>
                    <p className="text-gray-600">Redirecting...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Self Attendance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Location Status */}
                    <div className={`flex items-center justify-between p-4 rounded-lg ${status === 'blocked' ? 'bg-red-50 border border-red-200' : 'bg-blue-50'}`}>
                        <div className="flex items-center gap-3">
                            {status === 'blocked' ? <AlertOctagon className="text-red-500" /> : <MapPin className="text-blue-600" />}
                            <div>
                                <div className={`font-semibold ${status === 'blocked' ? 'text-red-900' : 'text-blue-900'}`}>
                                    {status === 'blocked' ? 'Out of Range' : 'GPS Location'}
                                </div>
                                <div className="text-xs text-gray-600">
                                    {coords ? `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}` : "Locating..."}
                                </div>
                                {distance !== null && (
                                    <div className={`text-xs font-bold ${distance > STRICT_RADIUS ? 'text-red-600' : 'text-green-600'}`}>
                                        Distance: {Math.round(distance)}m
                                    </div>
                                )}
                            </div>
                        </div>
                        {status === "locating" && <Loader2 className="animate-spin text-blue-400" />}
                        {status === "ready" && <CheckCircle className="text-green-500" />}
                    </div>

                    {/* Photo Capture */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">Proof Photo (Selfie)</label>
                        <div className="flex items-center gap-4">
                            <Button variant="outline" className="w-full relative overflow-hidden" asChild>
                                <label>
                                    <Camera className="mr-2 h-4 w-4" />
                                    {photo ? "Retake Photo" : "Take Photo"}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        capture="user"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </Button>
                        </div>
                        {photo && (
                            <div className="text-xs text-green-600 flex items-center gap-1 mt-1">
                                <CheckCircle className="h-3 w-3" /> Photo selected: {photo.name}
                            </div>
                        )}
                    </div>

                    {message && (
                        <div className={`p-3 rounded-md text-sm ${message.includes("Success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`} >
                            {message}
                        </div>
                    )}

                    <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="lg"
                        onClick={handleCheckIn}
                        disabled={loading || !coords || !photo || status === 'blocked'}
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Submit Check-in
                    </Button>

                </CardContent>
                <CardFooter className="text-xs text-center text-gray-400 justify-center">
                    Ensure you are within {STRICT_RADIUS}m of the office (TTVH001).
                </CardFooter>
            </Card>
        </div>
    );
}
