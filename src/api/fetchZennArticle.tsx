import axios from "axios";
import { ZennArticle } from "../interfaces/post";

export default async function fetchZennArticles() {
    try {
        const res = await axios.get('/api/zenn-articles', {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 15000, // 15秒のタイムアウト
        });

        if (res.data.error) {
            throw new Error(res.data.details || 'Failed to fetch articles');
        }

        return sortByDate(res.data.articles);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('リクエストがタイムアウトしました');
            }
            if (error.response?.status === 500) {
                throw new Error('サーバーエラーが発生しました');
            }
            if (!error.response) {
                throw new Error('ネットワークエラーが発生しました');
            }
        }
        throw error;
    }
}

function sortByDate(articles: ZennArticle[]) {
    return articles.sort((a: ZennArticle, b: ZennArticle) => {
        const aDate = new Date(a.body_updated_at);
        const bDate = new Date(b.body_updated_at);
        if (aDate < bDate) return 1;
        if (aDate > bDate) return -1;
        return 0;
    });
}
