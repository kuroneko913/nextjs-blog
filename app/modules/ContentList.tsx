'use client';

import ZennArticleList from "./ZennArticleList";
import SpeakerDeckSlideList from "./SpeakerDeckSlideList";

export default function ContentList() {
    return (
        <div>
            {/* Zenn記事セクション */}
            <ZennArticleList />
            
            {/* SpeakerDeckスライドセクション */}
            <SpeakerDeckSlideList />
        </div>
    );
} 