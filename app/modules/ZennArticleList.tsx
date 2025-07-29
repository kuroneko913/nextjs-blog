'use client';

import fetchZennArticles from "@/src/api/fetchZennArticle";
import { useEffect, useState, useRef, useCallback } from "react";
import ZennArticleBox from "./ZennArticleBox";
import {ZennArticle} from "@/src/interfaces/post";

// キャッシュの有効期限（ミリ秒）- 30分
const CACHE_DURATION = 30 * 60 * 1000;

interface CacheData {
    articles: ZennArticle[];
    timestamp: number;
}

export default function ZennArticleList() {
    const [articles, setArticles] = useState<ZennArticle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const cacheRef = useRef<CacheData | null>(null);

    const fetchArticles = useCallback(async () => {
        const now = Date.now();
        
        // キャッシュが有効かチェック
        if (cacheRef.current && (now - cacheRef.current.timestamp) < CACHE_DURATION) {
            setArticles(cacheRef.current.articles);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const zennArticles = await fetchZennArticles();
            
            // キャッシュを更新
            cacheRef.current = {
                articles: zennArticles,
                timestamp: now
            };
            
            setArticles(zennArticles);
        } catch (error) {
            console.error('Error fetching Zenn articles:', error);
            setError('記事の取得に失敗しました');
            
            // エラー時は古いキャッシュがあれば使用
            if (cacheRef.current) {
                setArticles(cacheRef.current.articles);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [fetchArticles]);

    if (loading && articles.length === 0) {
        return (
            <div className="sm:p-10">
                <div className="flex items-center justify-center py-8">
                    <div className="text-gray-600">記事を読み込み中...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="sm:p-10">
            <h1 className="text-2xl pb-10 font-bold">Zenn掲載記事</h1>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            <div className="flex gap-8 flex-wrap justify-start items-start">
                {articles.map((article: ZennArticle) => (
                    <ZennArticleBox article={article} key={article.slug} />
                ))}
            </div>
        </div>
    );
}
