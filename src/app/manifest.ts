import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "This Won’t Save Us",
    short_name: "TWSU",
    description: "A progressive’s guide to voting in Kansas City, Missouri.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf7ff",
    theme_color: "#6d3be0",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
