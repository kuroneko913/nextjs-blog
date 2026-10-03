import Product from "./Product";

export default function Base() {
    return (
        <div>
            <div className="w-full">
                <h2>DNAとアミノ酸の翻訳をモチーフにした暗号化ツール</h2>
                <p>DNAとアミノ酸の翻訳をモチーフにした暗号化ツールです。元ネタはこちら</p>
                <div className="max-w-2xl">
                    <iframe className="mx-auto w-full dark:opacity-80 h-56 py-4"
                        title="Genetic Codeの元となった実験ノート"
                        src={`https://hatenablog-parts.com/embed?url=https://github.com/kuroneko913/lab/blob/master/DNACodes.ipynb`}
                        loading="lazy"
                    />
                </div>
                <Product />
            </div>
        </div>
    );
}
