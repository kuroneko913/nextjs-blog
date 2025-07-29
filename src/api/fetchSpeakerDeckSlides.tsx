import axios from "axios";
import { SpeakerDeckSlide } from "../interfaces/post";

export default async function fetchSpeakerDeckSlides() {
    try {
        const res = await axios.get('/api/speakerdeck-slides', {
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 15000, // 15秒のタイムアウト
        });

        if (res.data.error) {
            throw new Error(res.data.details || 'Failed to fetch slides');
        }

        return sortByDate(res.data.slides);
    } catch (error) {
        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('リクエストがタイムアウトしました');
            }
            if (error.response?.status === 500) {
                throw new Error('サーバーエラーが発生しました');
            }
            if (!error.response) {
                throw new Error('ネットワークエラーが発生しました');
            }
        }
        throw error;
    }
}

function sortByDate(slides: SpeakerDeckSlide[]) {
    return slides.sort((a: SpeakerDeckSlide, b: SpeakerDeckSlide) => {
        const aDate = new Date(a.published_at);
        const bDate = new Date(b.published_at);
        if (aDate < bDate) return 1;
        if (aDate > bDate) return -1;
        return 0;
    });
} 