'use client';

import { useEffect, useState } from "react";

export default function TwitterTimeLine() {
    const [isMobile, setIsMobile] = useState(false);
    useEffect(()=>{
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isMobile = /iphone|ipod|ipad|android/.test( userAgent );
        setIsMobile(isMobile);
    }, []);
    useEffect(()=>{
        if (isMobile) {
            return;
        }
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        document.body.appendChild(script);
    }, [isMobile]);
    // Twitterタイムラインがスマホからだと表示されないようなので、スマホの場合は何も表示しない。
    if (isMobile) {
        return (
            <div></div>
        );
    }
    return (
        <div className="mt-10 max-w-sm mx-auto h-[50vh] sm:h-[100vh] overflow-scroll">
            <a className="twitter-timeline" 
                href="https://twitter.com/myblackcat7112?ref_src=twsrc%5Etfw"
            >
                Tweets by myblackcat7112
            </a>
        </div>
    );
}
