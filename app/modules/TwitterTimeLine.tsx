'use client';

import { useEffect } from "react";

export default function TwitterTimeLine() {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

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
