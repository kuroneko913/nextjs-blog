export async function now(args: { timezone: string }) {
    const { timezone } = args;
    if (!timezone) {
        return {
            "tool_response": {
                "name": "now",
                "result": "タイムゾーン(timezone)を {Asia/Tokyo} などの形式で指定してください。"
            },
        };
    }
    console.time("now");
    try {
        const datetime = new Date().toLocaleString('ja-JP', { timeZone: timezone });
        return {
            "tool_response": {
                "name": "now",
                "result": JSON.stringify(
                    {
                        datetime:datetime,
                        timezone:timezone
                    }
                ),
            },
        };
    } catch (error) {
        console.error('Error fetching time:', error);
        return {
            "tool_response": {
                "name": "now",
                "result": "時刻の取得に失敗しました。"
            },
        };
    } finally {
        console.timeEnd("now");
    }
}
