export default function Product() {
    return (
        <div className="product-area opacity-50 w-full sm:w-[50vw] pointer-events-none">
            <textarea className="w-full border-2 rounded p-4 my-4" placeholder="ここになにか文字を入力"></textarea>
            <div className="text-right">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    暗号化する
                </button>
            </div>
            <div className="my-10">
                <p>暗号化された文字列: ここに暗号化された文字列が表示されます。</p>
                <p className="whitespace-normal break-words">TACCTAAAGACTTACAAGAAAATCTACAAGCCGATTTACTTTACAATTTACAGTATTTACACCATCTACCGACTGACTTACACCATCTACAACATCTACG</p>
            </div>
            <textarea className="w-full border-2 rounded p-4 my-4" placeholder="ここになにか文字を入力"></textarea>
            <div className="text-right">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                    復号する
                </button>
            </div>
            <div className="mt-10">
                <p>復号された文字列: ここに復号された文字列が表示されます。</p>
                <p className="whitespace-normal break-words">ああああああ</p>
            </div>
        </div>
    );
}
