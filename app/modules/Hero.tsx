import Image from "next/image";
export default function Hero() {
    return (
        <div style={{ width: "100%", height: "50vh", overflow: "hidden", position: "relative" }}>
            <Image
              src="/images/hero.webp"
              alt="Hero"
              fill
              priority 
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: 'cover' }}
            />
        </div>
    );
}
