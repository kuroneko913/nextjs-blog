import { useState } from "react";

export default function Product() {
    const [plainMessage, setPlainMessage] = useState('');
    const updatePlainMessage = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPlainMessage(event.target.value);
    };
    const sendApiRequest = async (url: string, method: 'POST' | 'GET', body?: any) => {
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined,
        });
        return await response.json();
    };

    //TODO: 生成された鍵を使って暗号化を行うように変更
    const [encodeMessage, setEncodeMessage] = useState('');
    const sendEncodeRequest = async() => {
        const data = await sendApiRequest('/api/labs/genetic-codes/encode', 'POST', { message: plainMessage, keyData: keyData });
        if (data.message !== '') { 
            setEncodeMessage(data.message);
        }
        if (data.keyData) {
            setKeyData(data.keyData);
            setKeyResponseMessage("鍵の生成に成功しました");
            const hash = await generateHash(JSON.stringify(data.keyData));
            setHashedKey(hash);
        }
    };
    const [encodedMessage, setEncodedMessage] = useState('');
    const updateEncodedMessage = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setEncodedMessage(event.target.value);
    };
    const [decodedMessage, setDecodedMessage] = useState('');
    const sendDecodeRequest = async () => {
        let message = encodedMessage;
        if (message === '') {
            message = encodeMessage;
        }
        const data = await sendApiRequest('/api/labs/genetic-codes/decode', 'POST', { message: message, keyData: keyData });
        if (data.message) {
            setDecodedMessage(data.message);
        }
    };

    const [keyData, setKeyData] = useState('');
    const [keyResponseMessage, setKeyResponseMessage] = useState('');
    const [hashedKey, setHashedKey] = useState('');
    const sendKeyGenerateRequest = async () => {
        const data = await sendApiRequest('/api/labs/genetic-codes/generateKey', 'POST');
        if (data.keyData) {
            setKeyData(data.keyData);
            setKeyResponseMessage(data.message);
            const hash = await generateHash(JSON.stringify(data.keyData));
            setHashedKey(hash);
        }
    };

    const copyEncodedToDecode = () => {
        setEncodedMessage(encodeMessage);
    };

    // ハッシュ生成の関数
    const generateHash = async (keyData: string): Promise<string> => {
        if (keyData) {
            const encoder = new TextEncoder();
            const data = encoder.encode(keyData);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
        }
        return '';
    };

    return (
        <div className="product-area w-full sm:w-[50vw]">
            <div className="text-right">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg" onClick={sendKeyGenerateRequest}>
                    鍵を生成する
                </button>
            </div>
            <div className="my-10">
                <p>生成された鍵: ここに生成された鍵が表示されます。</p>
                <p>{keyResponseMessage}</p>
                {keyResponseMessage && <pre>SHA-256: { hashedKey }</pre>}
                { keyResponseMessage && <pre className="bg-gray-100 p-4 rounded">{JSON.stringify(keyData)}</pre>}
            </div>

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
            <div className="text-right">
                <button className="bg-gray-500 hover:bg-gray-700 text-white text-right font-bold py-2 px-4 rounded-lg mb-4" onClick={copyEncodedToDecode}>
                    復号エリアにコピー
                </button>
            </div>
            <textarea className="w-full border-2 rounded p-4 my-4" placeholder="ここになにか文字を入力" onChange={updateEncodedMessage} value={encodedMessage}></textarea>
            <div className="text-right">
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg" onClick={sendDecodeRequest}>
                    復号する
                </button>
            </div>
            <div className="mt-10">
                <p>復号された文字列: ここに復号された文字列が表示されます。</p>
                <p className="whitespace-normal break-words">{decodedMessage}</p>
            </div>
        </div>
    );
}
