"use client";

import axios from 'axios';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";

export default function LikeNum({ slug }: { slug: string }) {
  const [likeNum, setLikeNum] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  // getLike を useEffect 内で一度だけ実行
  useEffect(() => {
    const getLike = async () => {
      try {
        const res = await axios.get(`/api/blog-like?slug=${slug}`);
        if (res.status === 200) {
          setLikeNum(res.data.likes);
        }
      } catch (error) {
        console.error('Error fetching likes:', error);
      }
    };

    getLike(); // コンポーネントのマウント時に一度だけ実行
  }, [slug]);

  const toggleLike = async () => {
    if (loading) return; // 既にリクエスト中であれば処理しない

    setLoading(true); // ローディング開始
    try {
      const res = await axios.post('/api/blog-like', { slug });
      if (res.status === 200 && res.data.liked) {
        setLikeNum(prev => prev + 1); // いいね数をインクリメント
      } else if (res.status === 200 && !res.data.liked) {
        setLikeNum(prev => prev - 1); // いいね数をデクリメント
      }
    } catch (error) {
      console.error('Error liking the post:', error);
    } finally {
      setLoading(false); // ローディング終了
    }
  };

  return (
    <div className="w-full flex justify-end p-4">
      <button onClick={toggleLike} disabled={loading} className="flex items-center">
        <FontAwesomeIcon icon={faThumbsUp} className={`mr-2 ${loading ? 'animate-pulse' : 'text-green-500'}`} />
        <span>{likeNum}</span>
      </button>
    </div>
  );
}
