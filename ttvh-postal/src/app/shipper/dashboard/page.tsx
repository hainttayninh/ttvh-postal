"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { QrCode, MapPin, Package, History, LogOut } from "lucide-react";
import Link from "next/link";

export default function ShipperDashboard() {
    // Mock data for offline-first visual
    const [routes, setRoutes] = useState([
        { id: 1, name: "Morning Route A", deliveryCount: 12, status: "In Progress" },
        { id: 2, name: "Afternoon Route B", deliveryCount: 8, status: "Pending" },
    ]);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Mobile Header */}
            <header className="bg-blue-600 text-white p-4 sticky top-0 z-10 shadow-md">
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-bold">Shipper App</h1>
                    <div className="flex gap-2">
                        <button className="p-2"><LogOut className="h-5 w-5" /></button>
                    </div>
                </div>
            </header>

            <main className="p-4 space-y-6">
                {/* Quick Actions */}
                <section className="grid grid-cols-2 gap-4">
                    <Button size="lg" className="h-20 flex flex-col gap-2 bg-orange-500 hover:bg-orange-600">
                        <QrCode className="h-6 w-6" />
                        <span>Scan QR</span>
                    </Button>
                    <Button size="lg" className="h-20 flex flex-col gap-2 bg-blue-500 hover:bg-blue-600" asChild>
                        <Link href="/bcvh/attendance/self">
                            <MapPin className="h-6 w-6" />
                            <span>Check-in</span>
                        </Link>
                    </Button>
                </section>

                {/* Today's Routes */}
                <section>
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">My Routes (Offline)</h2>
                    <div className="space-y-3">
                        {routes.map(route => (
                            <Card key={route.id} className="border-l-4 border-l-blue-500">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-center">
                                        <CardTitle className="text-base">{route.name}</CardTitle>
                                        <span className={`text-xs px-2 py-1 rounded-full ${route.status === 'In Progress' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {route.status}
                                        </span>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Package className="h-4 w-4" />
                                        <span>{route.deliveryCount} Deliveries remaining</span>
                                    </div>
                                    <Button variant="outline" className="w-full mt-3 h-8 text-xs">
                                        Start Route
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* History / Stats */}
                <section>
                    <h2 className="text-lg font-semibold mb-3 text-gray-800">Performance</h2>
                    <Card>
                        <CardContent className="pt-6 grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-xl font-bold text-blue-600">45</div>
                                <div className="text-xs text-gray-500">Completed</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-orange-500">98%</div>
                                <div className="text-xs text-gray-500">Success Rate</div>
                            </div>
                            <div>
                                <div className="text-xl font-bold text-green-600">32km</div>
                                <div className="text-xs text-gray-500">Distance</div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around">
                <Button variant="ghost" className="flex flex-col gap-1 h-auto py-2 text-blue-600">
                    <MapPin className="h-5 w-5" />
                    <span className="text-[10px]">Routes</span>
                </Button>
                <Button variant="ghost" className="flex flex-col gap-1 h-auto py-2 text-gray-500">
                    <History className="h-5 w-5" />
                    <span className="text-[10px]">History</span>
                </Button>
            </nav>
        </div>
    );
}
