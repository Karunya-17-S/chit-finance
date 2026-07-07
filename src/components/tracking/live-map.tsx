"use client";

import * as React from "react";
import { ExternalLink, MapPin, Navigation, Smartphone } from "lucide-react";
import { SectionCard } from "@/components/shared/section-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getPingsByEmployee, getLatestPings } from "@/data";
import { useDataStore } from "@/store/data-store";
import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LocationPing } from "@/types";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker icons (Next.js/webpack breaks Leaflet's default asset resolution).
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Dynamically import Leaflet components to avoid SSR issues (Leaflet needs `window`).
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((mod) => mod.Polyline), { ssr: false });

interface LiveMapProps {
  /** Branch scope for branch admins; undefined = all branches (main admin). */
  branchId?: string;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-IN", { hour: "2-digit", minute: "2-digit" }).format(d);
}

function googleMapsUrl(ping: LocationPing): string {
  return `https://www.google.com/maps?q=${ping.lat},${ping.lng}`;
}

function googleMapsDirectionsUrl(ping: LocationPing): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${ping.lat},${ping.lng}`;
}

const PIN_COLORS = ["#8B1A1A", "#D4A843", "#22c55e", "#f59e0b"];

export function LiveMap({ branchId }: LiveMapProps) {
  const employees = useDataStore((s) => s.employees);
  const branches = useDataStore((s) => s.branches);

  const [branchFilter, setBranchFilter] = React.useState(branchId ?? "br-001");
  const effectiveBranchId = branchId ?? branchFilter;

  const latestPings = getLatestPings(effectiveBranchId);
  const trackedEmployees = latestPings
    .map((ping) => ({ ping, employee: employees.find((e) => e.id === ping.employeeId) }))
    .filter((t) => t.employee);

  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string | null>(null);
  const activeEmployeeId =
    selectedEmployeeId && trackedEmployees.some((t) => t.employee!.id === selectedEmployeeId)
      ? selectedEmployeeId
      : (trackedEmployees[0]?.employee!.id ?? null);

  const trail = activeEmployeeId ? getPingsByEmployee(activeEmployeeId) : [];

  // Calculate map center from all visible pings (falls back to Bengaluru coords if none).
  const allPings = trackedEmployees.flatMap((t) => getPingsByEmployee(t.employee!.id));
  const centerLat = allPings.length > 0 ? allPings.reduce((sum, p) => sum + p.lat, 0) / allPings.length : 12.9716;
  const centerLng = allPings.length > 0 ? allPings.reduce((sum, p) => sum + p.lng, 0) / allPings.length : 77.5946;

  function createMarkerIcon(color: string, label: string) {
    return L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: ${color}; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 10px; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${label}</div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  }

  if (trackedEmployees.length === 0) {
    return (
      <EmptyState
        icon={MapPin}
        title="No location data for this branch today"
        description="Employee movement appears here once they check in from the mobile app."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Smartphone className="h-4 w-4 shrink-0 text-gold" />
          Locations are reported live by the employee mobile app (GPS, every few minutes) while on collection rounds.
        </div>
        {!branchId && (
          <Select value={branchFilter} onValueChange={setBranchFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>
                  {b.location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {/* Map panel */}
        <SectionCard title="Movement Map" description="Today's routes — select an employee to highlight their trail" className="xl:col-span-3">
          <div className="h-[400px] w-full overflow-hidden rounded-xl border border-border">
            <MapContainer center={[centerLat, centerLng]} zoom={15} style={{ height: "100%", width: "100%" }} zoomControl={true}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Trail for selected employee */}
              {trail.length > 1 && (
                <Polyline positions={trail.map((p) => [p.lat, p.lng])} color="#8B1A1A" weight={3} dashArray="6,5" opacity={0.8} />
              )}

              {/* Trail waypoints */}
              {trail.map((p, i) => {
                const isLast = i === trail.length - 1;
                if (isLast) return null;
                return (
                  <Marker
                    key={p.id}
                    position={[p.lat, p.lng]}
                    icon={L.divIcon({
                      className: "waypoint-marker",
                      html: `<div style="background: white; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #8B1A1A; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>`,
                      iconSize: [10, 10],
                      iconAnchor: [5, 5],
                    })}
                  >
                    <Popup>{formatTime(p.timestamp)}</Popup>
                  </Marker>
                );
              })}

              {/* Employee markers */}
              {trackedEmployees.map(({ ping, employee }, idx) => {
                const active = employee!.id === activeEmployeeId;
                const color = PIN_COLORS[idx % PIN_COLORS.length];
                const markerIcon = createMarkerIcon(color, initials(employee!.name));

                return (
                  <Marker
                    key={ping.id}
                    position={[ping.lat, ping.lng]}
                    icon={markerIcon}
                    eventHandlers={{
                      click: () => setSelectedEmployeeId(employee!.id),
                    }}
                  >
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold">{employee!.name}</p>
                        <p className="text-sm text-muted-foreground">{ping.address}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(ping.timestamp)}</p>
                        <div className="mt-2 flex gap-2">
                          <a href={googleMapsUrl(ping)} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                            Google Maps
                          </a>
                          {active && (
                            <a
                              href={googleMapsDirectionsUrl(ping)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 hover:underline"
                            >
                              Directions
                            </a>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MapContainer>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Click on any employee pin to view details. Routes shown for selected employee.</p>
        </SectionCard>

        {/* Employee list + timeline */}
        <div className="space-y-4 xl:col-span-2">
          <SectionCard title="Field Staff" description="Last reported location">
            <div className="space-y-2">
              {trackedEmployees.map(({ ping, employee }) => (
                <button
                  key={employee!.id}
                  onClick={() => setSelectedEmployeeId(employee!.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                    employee!.id === activeEmployeeId ? "border-gold bg-maroon/5" : "border-border bg-card hover:border-gold/50"
                  )}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-maroon text-xs font-semibold text-white">
                    {initials(employee!.name)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">{employee!.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {ping.address} · {formatTime(ping.timestamp)}
                    </span>
                  </span>
                  <StatusBadge status={ping.status} />
                </button>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Movement Timeline" description="Today's check-ins for the selected employee">
            <div className="max-h-72 space-y-0 overflow-y-auto">
              {trail.map((p, i) => (
                <div key={p.id} className="relative flex gap-3 pb-4 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span
                      className={cn(
                        "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                        i === trail.length - 1 ? "bg-success ring-4 ring-success/20" : "bg-gold"
                      )}
                    />
                    {i < trail.length - 1 && <span className="w-px flex-1 bg-border" />}
                  </div>
                  <div className="min-w-0 flex-1 pb-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-foreground">{formatTime(p.timestamp)}</p>
                      <StatusBadge status={p.status} className="text-[10px]" />
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.address}</p>
                    <div className="mt-1 flex gap-3">
                      <a
                        href={googleMapsUrl(p)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-maroon hover:underline"
                      >
                        <ExternalLink className="h-3 w-3" /> Google Maps
                      </a>
                      {i === trail.length - 1 && (
                        <a
                          href={googleMapsDirectionsUrl(p)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-maroon hover:underline"
                        >
                          <Navigation className="h-3 w-3" /> Navigate
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {trail.length > 0 && (
              <Button asChild variant="outline" size="sm" className="mt-3 w-full">
                <a href={googleMapsUrl(trail[trail.length - 1])} target="_blank" rel="noopener noreferrer">
                  <MapPin className="h-3.5 w-3.5" /> Open Last Location in Google Maps
                </a>
              </Button>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}