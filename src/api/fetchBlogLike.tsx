import { headers } from "next/headers";

export default async function fetchBlogLike() {
    // サーバーサイドレンダリングのため、フルパスでリクエストを送る。
    const headersList = headers();
    const host = headersList.get('host');
    const protocol = headersList.get('x-forwarded-proto') || 'http';
    const res = await fetch(`${protocol}://${host}/api/blog-like`, {
        next: { revalidate: 60 * 30 }  // 30分間キャッシュ
    });
    const data = await res.json();
    return data.result;
}
