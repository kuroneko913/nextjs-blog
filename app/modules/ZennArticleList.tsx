'use client';

import fetchZennArticles from "@/src/api/fetchZennArticle";
import { useEffect, useState, useRef } from "react";
import ZennArticleBox from "./ZennArticleBox";
import {ZennArticle} from "@/src/interfaces/post";

export default function ZennArticleList() {
    const [articles, setArticles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const hasFetchedRef = useRef(false); // フェッチ済みかを追跡するためのフラグ

    useEffect(() => {
        if (hasFetchedRef.current) return; // すでにフェッチ済みなら何もしない
        hasFetchedRef.current = true;

        const getZenn = async () => {
            try {
                const zenn = await fetchZennArticles();
                setArticles(zenn);
            } catch (error) {
                console.error('Error fetching Zenn articles:', error);
            } finally {
                setLoading(false);
            }
        };
        getZenn();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="sm:p-10">
            <h1 className="text-2xl pb-10 font-bold">Zenn掲載記事</h1>
            <div className="flex gap-8 flex-wrap justify-start items-start">
                {articles.map((article: ZennArticle) => (
                    <ZennArticleBox article={article} key={article.slug} />
                ))}
            </div>
        </div>
    );
}
