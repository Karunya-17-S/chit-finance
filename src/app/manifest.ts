import type { MetadataRoute } from "next";

// Web app manifest — lets employees install the app on their phones
// (Chrome/Android: menu → "Add to Home Screen"; iOS Safari: Share → "Add to Home Screen").
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Shree Vaari Chit Finance",
    short_name: "Shree Vaari",
    description: "Chit finance collections, tracking and field app for Shree Vaari staff.",
    start_url: "/login",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf7f6",
    theme_color: "#4a0610",
    icons: [
      {
        src: "/icons/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
