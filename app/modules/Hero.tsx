import Image from "next/image";
export default function Hero() {
    return (
        <div style={{ width: "100%", height: "50vh", overflow: "hidden", position: "relative" }}>
            <Image layout="fill" objectFit="cover" src="/images/hero.webp" alt="Hero"/>
        </div>
    );
}
