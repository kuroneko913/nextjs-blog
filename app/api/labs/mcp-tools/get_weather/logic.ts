import axios from 'axios';

export async function get_weather(args: { location: string }) {
    const { location } = args;
    if (!location) {
        return {
            "tool_response": {
                "name": "get_weather",
                "result": "場所を指定してください。"
            },
        };
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
    let description = '不明';
    let temp = '不明';
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
        description = weatherRes.data?.weather?.[0]?.description ?? '不明';
        temp = weatherRes.data?.main?.temp ?? '不明';
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return {
            "tool_response": {
                "name": "get_weather",
                "result": "天気情報の取得に失敗しました。"
            },
        };
    } finally {
        console.timeEnd("weather");
    }

    return {
        "tool_response": {
            "name": "get_weather",
            "result":`${city}の天気は${description}で気温は${temp}度です。`,
        },
    };
}
