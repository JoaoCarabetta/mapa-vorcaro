import type { MetadataRoute } from "next";
import { loadEvents, loadPeople } from "@/lib/load";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://mapa-vorcaro.vercel.app";
  const staticRoutes = ["", "/pessoas", "/rede", "/metodologia", "/sobre", "/exportar"].map(
    (path) => ({
      url: `${base}${path || "/"}`,
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
    }),
  );
  const events = loadEvents().map((event) => ({
    url: `${base}/eventos/${event.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));
  const people = loadPeople().map((person) => ({
    url: `${base}/pessoas/${person.id}`,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));
  return [...staticRoutes, ...events, ...people];
}
