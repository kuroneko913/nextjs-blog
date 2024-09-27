import axios from "axios";
import { ZennArticle } from "../interfaces/post";

export default async function fetchZennArticles() {
    const username = 'kuroneko913';
    const res = await axios.get(`/api/zenn-articles?username=${username}`);
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
