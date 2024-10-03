import { MetadataRoute } from "next";
import { getAllPosts } from "@/src/fetch";
import { headers } from "next/headers";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const headersList = headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';

    const posts = await getAllPosts();
    const filtered = posts.filter((post) => post.slug !== "about");
    const dynamicPages = filtered.map((post) => ({
        url: `${protocol}://${host}/blog/${post.slug}`,
        lastModified: new Date(post.date).toISOString(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));
    const staticPages = [
        {
            url: `${protocol}://${host}/`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'monthly' as const,
            priority: 1,
        },
        {
            url: `${protocol}://${host}/about`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${protocol}://${host}/blog`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
        {
            url: `${protocol}://${host}/lab`,
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        },
    ];
    return [...dynamicPages, ...staticPages];
}
