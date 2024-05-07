export default function Header() {
    return (
        <header className="top-0 bg-white flex justify-between px-10 py-6 shadow-md">
            <div className="logo">
                <a className="text-xl text-gray-900 font-bold color-black" href="/">くろねこ。の実験室</a>
            </div>
            <ul className="flex space-x-16 text-gray-900 font-bold items-end">
                <li>
                    <a className="hover:text-blue-500" href="/">Home</a>
                </li>
                <li>
                    <a className="hover:text-blue-500" href="/blog">Blog</a>
                </li>
                <li>
                    <a className="hover:text-blue-500" href="/about">About</a>
                </li>    
            </ul>
        </header>
    );
}
