import { useState, useEffect } from "react";
import Product from "./Product";

export default function Base() {
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
                <Product />
            </div>
        </div>
    );
}
