import Image from "next/image";

export default function SuzuriBanner() {
    return (
        <div className="mt-8 site-card p-4 shadow-sm hover:shadow-md transition-shadow">
            <a 
                href="https://suzuri.jp/ninja-jMbrpk9Tgypv" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-center group"
            >
                <div className="mb-3">
                    <div className="text-lg font-bold text-[var(--site-ink)] mb-1 group-hover:text-[var(--site-accent)] transition-colors">
                        🎨 オリジナルグッズつくってみた！
                    </div>
                    <div className="text-sm text-[var(--site-muted)]">
                        くろねこ。のSUZURIショップ
                    </div>
                </div>
                
                <div className="bg-[var(--site-surface)] rounded-md p-3 group-hover:bg-[var(--site-soft)] transition-colors">
                    <div className="text-xs text-[var(--site-muted)] mb-2">SUZURI by GMOペパボ</div>
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-2xl">👕</span>
                        <span className="text-sm font-medium text-[var(--site-ink)]">
                            Tシャツなど
                        </span>
                        <span className="text-2xl">😸</span>
                    </div>
                    <div className="text-xs text-[var(--site-accent)] mt-2 font-medium">
                        どんな感じか見てみる？ →
                    </div>
                </div>
            </a>
        </div>
    );
}