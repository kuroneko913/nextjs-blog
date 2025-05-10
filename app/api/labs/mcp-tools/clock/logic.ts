export async function clock(args: { timezone: string }) {
    const { timezone } = args;
    if (!timezone) {
        throw new Error('タイムゾーン(timezone)を {Asia/Tokyo} などの形式で指定してください。');
    }
    console.time("clock");
    try {
        const datetime = new Date().toLocaleString('ja-JP', { timeZone: timezone });
        return {
            "content": [{
                "type": "text",
                "text": JSON.stringify(
                    {
                        datetime:datetime,
                        timezone:timezone
                    }
                ),
            }],
        };
    } catch (error) {
        console.error('Error fetching time:', error);
        throw new Error('時刻の取得に失敗しました。');
    } finally {
        console.timeEnd("clock");
    }
}
