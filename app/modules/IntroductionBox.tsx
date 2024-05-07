import Image from 'next/image';
import SocialIconBox from './SocialIconBox';

export default function IntroductionBox() {
    return (
        <div className="p-10 border-2" style={{ width: "100%", height: "100%", marginTop: "100px" }}>
            <div style={{ width: "100px", height: "100px", overflow: "hidden", position: "relative", borderRadius: "50%", margin: "auto" }}>
                <Image layout="fill" objectFit="cover" src="/images/hero.webp" alt="Hero"/>
            </div>
            <div className="mt-8 mb-16">
                <p>まさき。です。PHPエンジニアをやってます。</p>
                <p>自分の課題を技術で乗り越えるの好きかもしれないです。</p>
                <p>フロントエンドは苦手ですが、少しでもできるようになれたらな、ということでNextJSでこのブログサイトを作りました。</p>
            </div>
            <div className="mx-auto w-full max-w-md">
                <SocialIconBox />
            </div>
        </div>
    );
}
