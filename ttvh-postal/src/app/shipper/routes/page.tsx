"use client";

import dynamic from "next/dynamic";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Package, CheckSquare } from "lucide-react";
import { useState } from "react";

// Dynamically import ZoneMap
const ZoneMap = dynamic(() => import("@/components/zone-map"), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-gray-100 animate-pulse rounded-lg" />,
});

// Mock Zones (TTVH Area)
const MOCK_ZONES = [
    {
        id: "z1",
        name: "Zone A: Center",
        color: "blue",
        points: [
            [11.3150, 106.0960],
            [11.3150, 106.1000],
            [11.3120, 106.1000],
            [11.3120, 106.0960]
        ] as [number, number][]
    },
    {
        id: "z2",
        name: "Zone B: North",
        color: "orange",
        points: [
            [11.3150, 106.0960],
            [11.3180, 106.0960],
            [11.3180, 106.1000],
            [11.3150, 106.1000]
        ] as [number, number][]
    }
];

// Mock Tasks
const MOCK_TASKS = [
    { id: "t1", title: "Delivery #1001", address: "123 Main St", lat: 11.3140, lng: 106.0980, status: "pending" },
    { id: "t2", title: "Delivery #1002", address: "456 Side St", lat: 11.3130, lng: 106.0990, status: "pending" },
    { id: "t3", title: "Pickup #2001", address: "789 North Rd", lat: 11.3160, lng: 106.0970, status: "pending" },
];

export default function ShipperRoutesPage() {
    const [selectedTask, setSelectedTask] = useState<string | null>(null);

    return (
        <div className="flex flex-col h-screen max-h-screen bg-gray-100">
            {/* Map Section (Top Half on Mobile) */}
            <div className="h-[50%] lg:h-[60%] w-full relative">
                <ZoneMap zones={MOCK_ZONES} tasks={MOCK_TASKS} />
                <div className="absolute top-4 right-4 z-[400] bg-white p-2 rounded shadow text-xs">
                    {MOCK_ZONES.map(z => (
                        <div key={z.id} className="flex items-center gap-2 mb-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: z.color }}></div>
                            <span>{z.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Task List Section (Bottom Half) */}
            <div className="flex-1 overflow-y-auto p-4 bg-white rounded-t-xl shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] -mt-4 z-[500 relative]">
                <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" /> {/* Drag Handle visual */}

                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <CheckSquare className="text-blue-600" /> Today's Tasks
                </h2>

                <div className="space-y-3 pb-20">
                    {MOCK_TASKS.map(task => (
                        <Card
                            key={task.id}
                            className={`cursor-pointer transition-colors ${selectedTask === task.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`}
                            onClick={() => setSelectedTask(task.id)}
                        >
                            <CardHeader className="p-4 pb-2">
                                <div className="flex justify-between">
                                    <CardTitle className="text-base font-semibold text-gray-800">{task.title}</CardTitle>
                                    <span className="text-xs font-mono bg-gray-200 px-2 py-1 rounded">PENDING</span>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                    <MapPin className="h-4 w-4 text-gray-400" />
                                    {task.address}
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                                        <Navigation className="h-3 w-3 mr-1" /> Navigate
                                    </Button>
                                    <Button size="sm" variant="outline" className="flex-1">
                                        Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
