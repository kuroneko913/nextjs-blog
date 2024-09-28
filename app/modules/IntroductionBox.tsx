import Image from 'next/image';

export default function IntroductionBox(props: { props?: { marginTop: string } }) {

    return (
        <div className="p-10 max-w-sm border-2 mx-auto h-fit leading-relaxed" style={{ marginTop: props.props?.marginTop }}>
            <div style={{ width: "100px", height: "100px", overflow: "hidden", position: "relative", borderRadius: "50%", margin: "auto" }}>
            <Image
              src="/images/logo.webp"
              alt="Hero"
              fill
              priority 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
            />
            </div>
            <div className="mt-8 mb-16">
                <p>まさき。です。PHPエンジニアをやってます。</p>
                <p>自分の課題を技術で乗り越えるの好きかもしれないです。</p>
                <p>フロントエンドは苦手ですが、少しでもできるようになれたらな、ということでNextJSでこのブログサイトを作りました。</p>
            </div>
        </div>
    );
}
