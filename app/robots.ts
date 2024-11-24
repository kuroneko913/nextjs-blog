import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: ["/", "/blog", "/lab", "/about", "/images"],
            disallow: ["/api", "/_next", "/private"],
        },
    };
}
