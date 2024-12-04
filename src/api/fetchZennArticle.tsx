import axios from "axios";
import { ZennArticle } from "../interfaces/post";

export default async function fetchZennArticles() {
    const res = await axios.get('/api/zenn-articles', {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'max-age=14400',
        }
    });
    return sortByDate(res.data.articles);
}

function sortByDate(articles: ZennArticle[])
{
    return articles.sort((a: ZennArticle, b: ZennArticle) => {
        const aDate = new Date(a.body_updated_at);
        const bDate = new Date(b.body_updated_at);
        if (aDate < bDate) return 1;
        if (aDate > bDate) return -1;
        return 0;
    });
}
