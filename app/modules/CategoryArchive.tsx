export default function CategoryArchive() {
    return (
        <div className="px-10 w-1/4" style={{ height: "100%", marginTop: "100px" }}>
            <div>
                <h1 className="text-2xl pb-4 font-bold">Category</h1>
                <ul>
                    <li><a href="/blog?category=PHP">PHP (1)</a></li>
                    <li>JavaScript (2)</li>
                    <li>React (3)</li>
                    <li>NextJS (4)</li>
                    <li>その他 (3)</li>
                </ul>
            </div>
            <div className="py-10">
                <h1 className="text-2xl pb-4 font-bold">Archive</h1>
                <ul>
                    <li>2024.04 (2)</li>
                    <li>2024.05 (1)</li>
                </ul>
            </div>
        </div>
    );
}
