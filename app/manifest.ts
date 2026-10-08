import type { MetadataRoute } from "next";

/**
 * Web App Manifest for the existing production site.
 * Served by the App Router at /manifest.webmanifest.
 * Icon is the current square brand mark (1024×1024 JPEG).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "منصة ينفع",
    short_name: "ينفع",
    start_url: "/",
    display: "standalone",
    scope: "/",
    lang: "ar",
    dir: "rtl",
    theme_color: "#1875f5",
    background_color: "#f9fafb",
    icons: [
      {
        src: "/brand/yanfa-icon-mark.jpg",
        sizes: "1024x1024",
        type: "image/jpeg",
        purpose: "any",
      },
    ],
  };
}
