import Script from "next/script";

export const AdsenseBlock = () => {
    return (
        <Script 
            async 
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3191328913162172"
            crossOrigin="anonymous"
            strategy="afterInteractive"
        />
    );
};

// 個別の広告ユニット用コンポーネント
export const AdUnit = ({ 
    adSlot, 
    adFormat = "auto",
    fullWidthResponsive = true,
    style = { display: 'block' }
}: {
    adSlot: string;
    adFormat?: string;
    fullWidthResponsive?: boolean;
    style?: React.CSSProperties;
}) => {
    return (
        <ins 
            className="adsbygoogle"
            style={style}
            data-ad-client="ca-pub-3191328913162172"
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive={fullWidthResponsive}
        />
    );
};
