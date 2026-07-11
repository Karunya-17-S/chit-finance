"use client";

import * as React from "react";
import { Sparkles } from "lucide-react";
import { formatDate, todayDateString } from "@/lib/format";

function greetingForHour(hour: number) {
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

function useGreeting() {
  // Server has no local time, so render a neutral greeting first and swap to the
  // real one after mount to avoid a hydration mismatch.
  const [greeting, setGreeting] = React.useState("Good Day");
  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time client-only read of local time, needed to avoid SSR/client hydration mismatch
    setGreeting(greetingForHour(new Date().getHours()));
  }, []);
  return greeting;
}

export function HeroCard({ name }: { name: string }) {
  const greeting = useGreeting();

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br from-maroon-darker via-maroon to-maroon-dark px-6 py-7 text-white shadow-md lg:px-8">
      <div className="absolute -top-16 -right-10 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
      <div className="absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative z-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 flex items-center gap-2 text-gold">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">Shree Vaari Chit Finance</span>
          </div>
          <h2 className="text-2xl font-bold lg:text-3xl">
            {greeting}, {name}! 👋
          </h2>
          <p className="mt-1.5 text-sm text-white/70">
            Here&apos;s what&apos;s happening today with your chit groups.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-center backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-wide text-white/60">Today</p>
            <p className="text-sm font-semibold">{formatDate(todayDateString(), "short")}</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/logo.svg" alt="Shree Vaari Chit Finance" className="h-12 w-12 shrink-0 object-contain" />
        </div>
      </div>
    </div>
  );
}