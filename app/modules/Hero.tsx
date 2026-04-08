import Image from "next/image";

export default function Hero() {
    return (
        <div style={{ width: "100%", height: "100vh", overflow: "hidden", position: "relative" }}>
            <Image
              src="/images/hero.webp"
              alt="Hero"
              fill
              priority 
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'center' }}
            />
        </div>
    );
}
