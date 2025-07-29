'use client';

import fetchSpeakerDeckSlides from "@/src/api/fetchSpeakerDeckSlides";
import { useEffect, useState, useRef, useCallback } from "react";
import SpeakerDeckSlideBox from "./SpeakerDeckSlideBox";
import { SpeakerDeckSlide } from "@/src/interfaces/post";

// キャッシュの有効期限（ミリ秒）- 30分
const CACHE_DURATION = 30 * 60 * 1000;

interface CacheData {
    slides: SpeakerDeckSlide[];
    timestamp: number;
}

export default function SpeakerDeckSlideList() {
    const [slides, setSlides] = useState<SpeakerDeckSlide[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const cacheRef = useRef<CacheData | null>(null);

    const fetchSlides = useCallback(async () => {
        const now = Date.now();
        
        // キャッシュが有効かチェック
        if (cacheRef.current && (now - cacheRef.current.timestamp) < CACHE_DURATION) {
            setSlides(cacheRef.current.slides);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const speakerDeckSlides = await fetchSpeakerDeckSlides();
            
            // キャッシュを更新
            cacheRef.current = {
                slides: speakerDeckSlides,
                timestamp: now
            };
            
            setSlides(speakerDeckSlides);
        } catch (error) {
            console.error('Error fetching SpeakerDeck slides:', error);
            setError('スライドの取得に失敗しました');
            
            // エラー時は古いキャッシュがあれば使用
            if (cacheRef.current) {
                setSlides(cacheRef.current.slides);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSlides();
    }, [fetchSlides]);

    if (loading && slides.length === 0) {
        return (
            <div className="sm:p-10">
                <div className="flex items-center justify-center py-8">
                    <div className="text-gray-600">スライドを読み込み中...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="sm:p-10">
            <h1 className="text-2xl pb-10 font-bold">SpeakerDeck スライド</h1>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            <div className="flex gap-8 flex-wrap justify-start items-start">
                {slides.map((slide: SpeakerDeckSlide) => (
                    <SpeakerDeckSlideBox slide={slide} key={slide.slug} />
                ))}
            </div>
            
            {slides.length === 0 && !loading && (
                <div className="text-center py-8 text-gray-500">
                    スライドが見つかりませんでした
                </div>
            )}
            
            {cacheRef.current && (
                <div className="mt-4 text-xs text-gray-500 text-center">
                    最終更新: {new Date(cacheRef.current.timestamp).toLocaleString('ja-JP')}
                </div>
            )}
        </div>
    );
} 