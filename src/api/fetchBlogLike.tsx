import { getLikeCounts } from "@/src/blogLikes";

export default async function fetchBlogLike() {
    // No Host-header-derived internal HTTP request. A limit/outage must not break pages.
    try { return await getLikeCounts(); }
    catch { return {}; }
}
