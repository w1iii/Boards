import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BOARDS. | Master the NLE Nursing Board Exam",
    short_name: "BOARDS.",
    description:
      "AI-powered practice exams designed for Philippine nursing boards.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#F2E8C6",
    theme_color: "#952323",
    orientation: "any",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  }
}
