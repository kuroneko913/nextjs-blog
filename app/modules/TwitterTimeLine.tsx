'use client';

import dynamic from "next/dynamic";

const Timeline = dynamic(
    () => import("react-twitter-widgets").then((module) => module.Timeline),
    { ssr: false },
);

const dataSource = { sourceType: "profile", screenName: "myblackcat7112" };
const options = { height: 600, lang: "ja", dnt: true };

export default function TwitterTimeLine() {
    return (
        <section className="site-card mt-10 p-4" aria-labelledby="x-timeline-title">
            <h2 id="x-timeline-title" className="font-bold mb-3">X</h2>
            <a className="site-button mb-4" href="https://x.com/myblackcat7112"
                target="_blank" rel="noopener noreferrer">
                @myblackcat7112 を見る ↗
            </a>
            <Timeline dataSource={dataSource} options={options}
                renderError={() => <p className="text-sm">投稿はXでご覧いただけます。</p>} />
        </section>
    );
}
