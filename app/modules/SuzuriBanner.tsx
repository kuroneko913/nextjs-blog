import Image from "next/image";

export default function SuzuriBanner() {
    return (
        <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <a 
                href="https://suzuri.jp/ninja-jMbrpk9Tgypv" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block text-center group"
            >
                <div className="mb-3">
                    <div className="text-lg font-bold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                        🎨 オリジナルグッズつくってみた！
                    </div>
                    <div className="text-sm text-gray-600">
                        くろねこ。のSUZURIショップ
                    </div>
                </div>
                
                <div className="bg-white rounded-md p-3 group-hover:bg-gray-50 transition-colors">
                    <div className="text-xs text-gray-500 mb-2">SUZURI by GMOペパボ</div>
                    <div className="flex items-center justify-center space-x-2">
                        <span className="text-2xl">👕</span>
                        <span className="text-sm font-medium text-gray-700">
                            Tシャツなど
                        </span>
                        <span className="text-2xl">😸</span>
                    </div>
                    <div className="text-xs text-purple-600 mt-2 font-medium">
                        どんな感じか見てみる？ →
                    </div>
                </div>
            </a>
        </div>
    );
}