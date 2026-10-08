import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aussie Energy Savers",
    short_name: "AES",
    description: "Track your solar install, request quotes and earn referral rewards.",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#181818",
    theme_color: "#181818",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
