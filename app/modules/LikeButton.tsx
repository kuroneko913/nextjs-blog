"use client";

import axios from 'axios';
import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";

export default function LikeButton({ slug }: { slug: string }) {
  const [likeNum, setLikeNum] = useState<number>(0);

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
    try {
      const res = await axios.post('/api/blog-like', { slug });
      if (res.status === 200 && res.data.liked) {
        setLikeNum(prev => prev + 1); // いいね数をインクリメント
      } else if (res.status === 200 && !res.data.liked) {
        setLikeNum(prev => prev - 1); // いいね数をデクリメント
      }
    } catch (error) {
      console.error('Error liking the post:', error);
    }
  };

  return (
    <div className="w-full flex justify-end">
    <button
      className="mt-8 w-40 rounded-full bg-green-500 py-2 px-4 font-bold text-white hover:bg-green-700 flex-end"
      onClick={toggleLike}
    >
    <FontAwesomeIcon icon={faThumbsUp} className="mr-2"/>
      いいね！<span>{likeNum}</span>
    </button>
    </div>
  );
}
