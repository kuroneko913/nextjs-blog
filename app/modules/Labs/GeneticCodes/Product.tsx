import { useState } from "react";

export default function Product() {
    const [plainMessage, setPlainMessage] = useState('');
    const updatePlainMessage = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPlainMessage(event.target.value);
    };
    const [encodeMessage, setEncodeMessage] = useState('');
    const sendEncodeRequest = async() => {
        const response = await fetch('/api/labs/genetic-codes/encode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: plainMessage }),
        });
        const data = await response.json();
        if (data.message !== '') { 
            setEncodeMessage(data.message);
        }
    };
    const [encodedMessage, setEncodedMessage] = useState('');
    const [decodeMessage, setDecodeMessage] = useState('');
    const updateEncodedMessage = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEncodedMessage(event.target.value);
    };
    const sendDecodeRequest = async() => {
        const response = await fetch('/api/labs/genetic-codes/decode', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: encodedMessage }),
        });
        const data = await response.json();
        if (data.message) {
            setDecodeMessage(data.message);
        }
    };
    return (
        <div className="product-area w-full sm:w-[50vw]">
            <textarea className="w-full border-2 rounded p-4 my-4" placeholder="ここになにか文字を入力" onChange={updatePlainMessage}></textarea>
            <div className="text-right">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg" onClick={sendEncodeRequest}>
                    暗号化する
                </button>
            </div>
            <div className="my-10">
                <p>暗号化された文字列: ここに暗号化された文字列が表示されます。</p>
                <p className="whitespace-normal break-words">{encodeMessage}</p>
            </div>
            <textarea className="w-full border-2 rounded p-4 my-4" placeholder="ここになにか文字を入力" onChange={updateEncodedMessage}></textarea>
            <div className="text-right">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg" onClick={sendDecodeRequest}>
                    復号する
                </button>
            </div>
            <div className="mt-10">
                <p>復号された文字列: ここに復号された文字列が表示されます。</p>
                <p className="whitespace-normal break-words">{decodeMessage}</p>
            </div>
        </div>
    );
}
