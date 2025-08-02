import { SpeakerDeckSlide } from "@/src/interfaces/post";
import { useState } from "react";
import Image from "next/image";

interface SpeakerDeckSlideBoxProps {
    slide: SpeakerDeckSlide;
}

export default function SpeakerDeckSlideBox({ slide }: SpeakerDeckSlideBoxProps) {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    const handleImageError = () => {
        console.error(`Image load error for slide: ${slide.title}`, {
            url: slide.thumbnail_url
        });
        setImageError(true);
        setImageLoading(false);
    };

    const handleImageLoad = () => {
        console.log(`Image loaded successfully for slide: ${slide.title}`);
        setImageLoading(false);
        setImageError(false);
    };

    // 投稿日をフォーマット
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'numeric',
                day: 'numeric'
            });
        } catch (error) {
            return null;
        }
    };

    const formattedDate = formatDate(slide.published_at);

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 w-full max-w-sm hover:scale-105">
            <a href={slide.url} target="_blank" rel="noopener noreferrer">
                <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center relative overflow-hidden">
                    {slide.thumbnail_url && !imageError ? (
                        <>
                            {imageLoading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                </div>
                            )}
                            <Image
                                src={slide.thumbnail_url}
                                alt={slide.title}
                                fill
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                className={`object-contain transition-all duration-300 ${
                                    imageLoading ? 'opacity-0' : 'opacity-100'
                                } hover:scale-110`}
                                onError={handleImageError}
                                onLoad={handleImageLoad}
                            />
                        </>
                    ) : (
                        <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-full h-full flex items-center justify-center">
                            <div className="text-white text-center">
                                <div className="text-4xl mb-2">📊</div>
                                <div className="text-sm opacity-80">SpeakerDeck</div>
                                {imageError && (
                                    <div className="text-xs mt-1 opacity-60">
                                        画像読み込みエラー
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 hover:text-blue-600 transition-colors leading-tight">
                        {slide.title}
                    </h3>
                    
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <div className="flex items-center space-x-4">
                            {(slide.view_count ?? 0) > 0 && (
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"/>
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd"/>
                                    </svg>
                                    {formatCount(slide.view_count ?? 0)}
                                </span>
                            )}
                            
                            {(slide.star_count ?? 0) > 0 && (
                                <span className="flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                                    </svg>
                                    {formatCount(slide.star_count ?? 0)}
                                </span>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                            📊 SpeakerDeck
                        </span>
                        {formattedDate && (
                            <span className="text-xs text-gray-500">
                                {formattedDate}
                            </span>
                        )}
                    </div>
                </div>
            </a>
        </div>
    );
}

function formatCount(count: number): string {
    if (count >= 1000000) {
        return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k';
    } else {
        return count.toString();
    }
} 