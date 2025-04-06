import Image from "next/image";

export default function ArticleThumbnail({ src }: { src: string }) {
    src = (src === "" || src === undefined) ? "/images/hero.webp" : src;

    return (
        <div
            style={{
                width: "100%",
                height: "60vh", // 必要に応じて高さを調整
                overflow: "hidden",
                position: "relative"
            }}
            className="mt-4"
        >
            <Image
                src={src}
                alt="thumbnail"
                fill
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{
                    objectFit: "contain",
                    objectPosition: "center",
                }}
            />
        </div>
    );
}
