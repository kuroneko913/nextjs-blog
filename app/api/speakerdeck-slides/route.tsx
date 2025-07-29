import axios from 'axios';
import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// キャッシュ用のインメモリストレージ
let cachedData: { slides: any[], timestamp: number } | null = null;
const CACHE_DURATION = 15 * 60 * 1000; // 15分

// 除外するスラッグのリスト
const EXCLUDED_SLUGS = ['following', 'followers', 'stars'];

// 個別スライドページから1枚目の画像を取得する関数
async function getSlidePreviewImage(slideUrl: string): Promise<string> {
    try {
        const res = await axios.get(slideUrl, {
            timeout: 8000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(res.data);
        
        // 優先順位1: og:imageメタタグから高解像度画像を取得
        const ogImage = $('meta[property="og:image"]').attr('content');
        if (ogImage && ogImage.includes('slide_0.jpg')) {
            return ogImage;
        }

        // 優先順位2: twitter:image:srcメタタグから取得
        const twitterImage = $('meta[name="twitter:image:src"]').attr('content');
        if (twitterImage && twitterImage.includes('slide_0.jpg')) {
            return twitterImage;
        }

        // 優先順位3: その他のog:image
        if (ogImage) {
            return ogImage;
        }

        // 優先順位4: SpeakerDeckの埋め込み画像を取得
        const selectors = [
            '.speakerdeck-embed img',
            '.deck img:first',
            '.slide img:first',
            'img[src*="speakerdeck"]',
            '.preview img',
            'img[alt*="slide"]'
        ];

        for (const selector of selectors) {
            const img = $(selector).first();
            const src = img.attr('src') || img.attr('data-src');
            if (src && src.includes('speakerdeck')) {
                return src.startsWith('//') ? `https:${src}` : src;
            }
        }

        return '';
    } catch (error) {
        console.error(`Error fetching preview for ${slideUrl}:`, error);
        return '';
    }
}

// GETリクエストの処理
export async function GET(): Promise<NextResponse> {
    try {
        const now = Date.now();
        
        // キャッシュが有効かチェック
        if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
            return NextResponse.json(
                { slides: cachedData.slides, cached: true }, 
                { 
                    status: 200,
                    headers: {
                        'Cache-Control': 'public, max-age=900', // 15分のブラウザキャッシュ
                        'X-Cache-Status': 'HIT'
                    }
                }
            );
        }

        // SpeakerDeckのプロフィールページをスクレイピング
        const username = 'myblackcat7112';
        const profileUrl = `https://speakerdeck.com/${username}`;
        
        const res = await axios.get(profileUrl, {
            timeout: 10000, // 10秒のタイムアウト
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        const $ = cheerio.load(res.data);
        const slidePromises: Promise<any>[] = [];

        // 実際のHTMLの構造に基づいてスライドの情報を抽出
        $('a[href*="/myblackcat7112/"]').each((_index: number, element: any) => {
            const $link = $(element);
            const href = $link.attr('href');
            
            if (!href || !href.includes('/myblackcat7112/')) return;
            
            const slug = href.split('/').pop() || '';
            
            // 除外するスラッグをスキップ
            if (EXCLUDED_SLUGS.includes(slug)) return;
            
            const title = $link.find('h3, .deck-title, [class*="title"]').text().trim() || 
                         $link.text().trim().split('\n')[0].trim();
            
            // 統計情報を取得（viewsとstars）
            const statsText = $link.find('[class*="stats"], [class*="view"], [class*="star"]').text();
            const viewMatch = statsText.match(/(\d+(?:\.\d+)?k?)\s*(?:views?)?/i);
            const starMatch = statsText.match(/(\d+(?:\.\d+)?k?)\s*(?:stars?)?/i);
            
            const view_count = viewMatch ? parseCount(viewMatch[1]) : 0;
            const star_count = starMatch ? parseCount(starMatch[1]) : 0;

            if (title && href && slug && title.length > 10) { // タイトルが短すぎるものは除外
                const slideUrl = `https://speakerdeck.com${href}`;
                
                // 各スライドの1枚目画像を並行して取得
                const slidePromise = getSlidePreviewImage(slideUrl).then(thumbnail_url => ({
                    id: slug,
                    title: title,
                    slug: slug,
                    url: slideUrl,
                    thumbnail_url: thumbnail_url,
                    published_at: new Date().toISOString(),
                    view_count: view_count,
                    star_count: star_count,
                    description: '',
                    category: 'presentation'
                }));
                
                slidePromises.push(slidePromise);
            }
        });

        // 代替方法：より一般的なセレクターを試す
        if (slidePromises.length === 0) {
            $('a').each((_index: number, element: any) => {
                const $link = $(element);
                const href = $link.attr('href');
                
                if (!href || !href.includes('/myblackcat7112/') || href === '/myblackcat7112') return;
                
                const slug = href.split('/').pop() || '';
                
                // 除外するスラッグをスキップ
                if (EXCLUDED_SLUGS.includes(slug)) return;
                
                const title = $link.find('*').text().trim() || $link.text().trim();
                if (!title || title.length < 10) return; // タイトルが短すぎる場合はスキップ
                
                const slideUrl = `https://speakerdeck.com${href}`;
                
                const slidePromise = getSlidePreviewImage(slideUrl).then(thumbnail_url => ({
                    id: slug,
                    title: title.split('\n')[0].trim(),
                    slug: slug,
                    url: slideUrl,
                    thumbnail_url: thumbnail_url,
                    published_at: new Date().toISOString(),
                    view_count: 0,
                    star_count: 0,
                    description: '',
                    category: 'presentation'
                }));
                
                slidePromises.push(slidePromise);
            });
        }

        // 全てのスライドの画像取得を並行実行
        const slidesWithImages = await Promise.all(slidePromises);

        // 重複を削除し、除外スラッグを再度フィルタリング
        const uniqueSlides = slidesWithImages
            .filter((slide, index, self) => 
                index === self.findIndex(s => s.slug === slide.slug)
            )
            .filter(slide => !EXCLUDED_SLUGS.includes(slide.slug));

        // キャッシュを更新
        cachedData = {
            slides: uniqueSlides,
            timestamp: now
        };

        // APIレスポンスをクライアントに返す
        return NextResponse.json(
            { slides: uniqueSlides, cached: false }, 
            { 
                status: 200,
                headers: {
                    'Cache-Control': 'public, max-age=900', // 15分のブラウザキャッシュ
                    'X-Cache-Status': 'MISS'
                }
            }
        );
    } catch (error) {
        console.error('Error fetching SpeakerDeck slides:', error);

        // エラー時は古いキャッシュがあれば返す
        if (cachedData) {
            return NextResponse.json(
                { slides: cachedData.slides, cached: true, stale: true }, 
                { 
                    status: 200,
                    headers: {
                        'Cache-Control': 'public, max-age=300', // 5分の短いキャッシュ
                        'X-Cache-Status': 'STALE'
                    }
                }
            );
        }

        return NextResponse.json(
            { error: 'Failed to fetch slides', details: error instanceof Error ? error.message : 'Unknown error' }, 
            { status: 500 }
        );
    }
}

// 「1.2k」や「500」などのテキストを数値に変換するヘルパー関数
function parseCount(text: string): number {
    if (!text) return 0;
    
    const match = text.match(/[\d.]+/);
    if (!match) return 0;
    
    const number = parseFloat(match[0]);
    
    if (text.toLowerCase().includes('k')) {
        return Math.round(number * 1000);
    } else if (text.toLowerCase().includes('m')) {
        return Math.round(number * 1000000);
    }
    
    return Math.round(number);
} 