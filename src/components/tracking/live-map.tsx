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

const PIN_COLORS = ["var(--maroon)", "var(--gold)", "var(--success)", "var(--warning)"];

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
  const activeEmployeeId = selectedEmployeeId && trackedEmployees.some((t) => t.employee!.id === selectedEmployeeId)
    ? selectedEmployeeId
    : trackedEmployees[0]?.employee!.id ?? null;

  const trail = activeEmployeeId ? getPingsByEmployee(activeEmployeeId) : [];

  // Normalize lat/lng of all visible pings into the SVG viewBox with padding.
  const allPings = trackedEmployees.flatMap((t) => getPingsByEmployee(t.employee!.id));
  const lats = allPings.map((p) => p.lat);
  const lngs = allPings.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const W = 520;
  const H = 340;
  const PAD = 44;

  function project(ping: LocationPing): { x: number; y: number } {
    const x = maxLng === minLng ? W / 2 : PAD + ((ping.lng - minLng) / (maxLng - minLng)) * (W - PAD * 2);
    const y = maxLat === minLat ? H / 2 : H - PAD - ((ping.lat - minLat) / (maxLat - minLat)) * (H - PAD * 2);
    return { x, y };
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
          <div className="overflow-hidden rounded-xl border border-border bg-[#f2efe9] dark:bg-[#241f1a]">
            <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
              {/* stylized city grid */}
              {Array.from({ length: 12 }).map((_, i) => (
                <line key={`v${i}`} x1={(i + 1) * (W / 13)} y1={0} x2={(i + 1) * (W / 13)} y2={H} stroke="var(--border)" strokeWidth={1} opacity={0.55} />
              ))}
              {Array.from({ length: 8 }).map((_, i) => (
                <line key={`h${i}`} x1={0} y1={(i + 1) * (H / 9)} x2={W} y2={(i + 1) * (H / 9)} stroke="var(--border)" strokeWidth={1} opacity={0.55} />
              ))}
              {/* main roads */}
              <line x1={0} y1={H * 0.62} x2={W} y2={H * 0.42} stroke="var(--muted-foreground)" strokeWidth={5} opacity={0.14} />
              <line x1={W * 0.3} y1={0} x2={W * 0.52} y2={H} stroke="var(--muted-foreground)" strokeWidth={5} opacity={0.14} />

              {/* selected employee trail */}
              {trail.length > 1 && (
                <polyline
                  points={trail.map((p) => { const { x, y } = project(p); return `${x},${y}`; }).join(" ")}
                  fill="none"
                  stroke="var(--maroon)"
                  strokeWidth={2.5}
                  strokeDasharray="6 5"
                  strokeLinecap="round"
                  opacity={0.8}
                />
              )}
              {/* trail waypoints */}
              {trail.map((p, i) => {
                const { x, y } = project(p);
                const isLast = i === trail.length - 1;
                return (
                  <g key={p.id}>
                    <circle cx={x} cy={y} r={isLast ? 0 : 4.5} fill="var(--card)" stroke="var(--maroon)" strokeWidth={2} />
                    {!isLast && (
                      <text x={x} y={y - 9} textAnchor="middle" fontSize={9} fill="var(--muted-foreground)">
                        {formatTime(p.timestamp)}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* latest position pins for all employees */}
              {trackedEmployees.map(({ ping, employee }, idx) => {
                const { x, y } = project(ping);
                const active = employee!.id === activeEmployeeId;
                const color = PIN_COLORS[idx % PIN_COLORS.length];
                return (
                  <g
                    key={ping.id}
                    onClick={() => setSelectedEmployeeId(employee!.id)}
                    className="cursor-pointer"
                    opacity={active ? 1 : 0.65}
                  >
                    {active && <circle cx={x} cy={y} r={19} fill={color} opacity={0.15} />}
                    <circle cx={x} cy={y} r={13} fill={color} stroke="var(--card)" strokeWidth={2.5} />
                    <text x={x} y={y + 3.5} textAnchor="middle" fontSize={9} fontWeight={700} fill="#fff">
                      {initials(employee!.name)}
                    </text>
                    <text x={x} y={y + 30} textAnchor="middle" fontSize={10} fontWeight={600} fill="var(--foreground)">
                      {employee!.name.split(" ")[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Stylized route preview — use the Google Maps links in the timeline for exact street navigation.
          </p>
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
