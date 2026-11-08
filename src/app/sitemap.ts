import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, priority: 1 },
    ...projects.flatMap((p) => [
      { url: `${SITE_URL}/work/${p.slug}`, priority: 0.8 },
      ...p.sections.map((s) => ({ url: `${SITE_URL}/work/${p.slug}/${s.slug}`, priority: 0.6 })),
    ]),
  ];
}
