import { useState, useEffect } from "react";
import Product from "./Product";

export default function Base() {
    // 開発環境の場合のみ、ベータ機能を表示する
    const [showBetaFeature, setShowBetaFeature] = useState(false);
    useEffect(() => {
        setShowBetaFeature(process.env.NEXT_PUBLIC_IS_DEVELOPMENT === 'true');
    }, []);
    return (
        <div>
            <h1>Lab</h1>
            <p>ちょっとしたアプリケーションなどを実験的に作っていく場所にします。</p>
            <div className="mt-4 w-full sm:w-[50vw]">
                <h2>DNAとアミノ酸の翻訳をモチーフにした暗号化ツール</h2>
                <p>DNAとアミノ酸の翻訳をモチーフにした暗号化ツールです。元ネタはこちら</p>
                <div className="max-w-2xl">
                    <iframe className="mx-auto w-full dark:opacity-80 h-56 py-4"
                        src={`https://hatenablog-parts.com/embed?url=https://github.com/kuroneko913/lab/blob/master/DNACodes.ipynb`}
                        loading="lazy"
                    />
                </div>
                { !showBetaFeature && <p className="my-10">工事中...</p> }
                { showBetaFeature && <Product /> }
            </div>
        </div>
    );
}
