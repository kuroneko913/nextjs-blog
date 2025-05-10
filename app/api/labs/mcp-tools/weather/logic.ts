import axios from 'axios';

export async function weather(args: { location: string }) {
    const { location } = args;
    if (!location) {
        throw new Error('場所を指定してください。');
    }
    const cityMap: Record<string, string> = {
        '東京': 'Tokyo,JP',
        '大阪': 'Osaka,JP',
        '名古屋': 'Nagoya,JP',
        '札幌': 'Sapporo,JP',
        '福岡': 'Fukuoka,JP',
        '横浜': 'Yokohama,JP',
    }
    const city = cityMap[location.toLowerCase()] || location;
    // OpenWeatherMap APIを使用して天気情報を取得
    console.time("weather");
    let weather = '不明';
    let temperature = '不明';
    let humidity = '不明';
    try {
        const weatherRes = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
            params: {
                q: city,
                appid: process.env.OPENWEATHER_API_KEY,
                units: 'metric',
                lang: 'ja',
            },
            timeout: 2000,
        });
        weather = weatherRes.data?.weather?.[0]?.description ?? '不明';
        temperature = weatherRes.data?.main?.temp ?? '不明';
        humidity = weatherRes.data?.main?.humidity ?? '不明';
    } catch (error) {
        console.error('Error fetching weather data:', error);
        throw new Error('天気情報の取得に失敗しました。');
    } finally {
        console.timeEnd("weather");
    }

    return {
        "content": [{
            "type": "text",
            "text": JSON.stringify({
                "location": city,
                "weather": weather,
                "temperature": temperature,
                "humidity": humidity,
            }),
        }],
    };
}
