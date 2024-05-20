import Image from 'next/image';
import { socialIcons } from '@/src/constants/socialIcons';
import SocialIconBox from './SocialIconBox';

export default function IntroductionBox(props: { props?: { marginTop: string } }) {
    let icons = structuredClone(socialIcons);
    const resizeIcons = icons.map(icon => {
        icon.width = "32px";
        icon.height = "32px";
        return icon;
    });

    return (
        <div className="p-10 w-1/4 border-2" style={{ height: "100%", marginTop: props.props?.marginTop }}>
            <div style={{ width: "100px", height: "100px", overflow: "hidden", position: "relative", borderRadius: "50%", margin: "auto" }}>
                <Image layout="fill" objectFit="cover" src="/images/hero.webp" alt="Hero"/>
            </div>
            <div className="mt-8 mb-16">
                <p>まさき。です。PHPエンジニアをやってます。</p>
                <p>自分の課題を技術で乗り越えるの好きかもしれないです。</p>
                <p>フロントエンドは苦手ですが、少しでもできるようになれたらな、ということでNextJSでこのブログサイトを作りました。</p>
            </div>
            <div className="mx-auto w-full max-w-md flex justify-center basis-1">
                <SocialIconBox icons={resizeIcons} />
            </div>
        </div>
    );
}
