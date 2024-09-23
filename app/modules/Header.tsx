"use client";
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <header className="top-0 bg-white flex justify-between items-center px-4 sm:px-20 py-4 shadow-md w-full">
            {/* ハンバーガーメニュー(クローズ時) */}
            <div className={`w-full ${isMenuOpen ? 'hidden' : 'flex'} justify-between items-center`}>
                <div className="logo">
                    <a className="text-2xl text-gray-900 font-bold color-black" href="/">くろねこ。の実験室</a>
                </div>
                {/* ハンバーガーメニューのアイコンをsm未満では出す */}
                <div className="flex sm:hidden items-center px-4">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-900 focus:outline-none">
                        <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} />
                    </button>
                </div>
            </div>
            {/* ハンバーガーメニュー(オープン時) */}
            <div className={`${isMenuOpen ? 'flex' : 'hidden'} sm:hidden fixed inset-0 bg-white flex-col justify-start items-center z-50`}>
                <div className="w-full flex justify-between items-center py-6 px-4">
                    <div className="logo">
                        <a className="text-2xl text-gray-900 font-bold color-black" href="/">くろねこ。の実験室</a>
                    </div>
                    {/* ハンバーガーメニューのアイコンをsm未満では出す */}
                    <div className="flex sm:hidden items-center px-4">
                        <button onClick={() => setIsMenuOpen(false)} className="text-gray-900 focus:outline-none">
                           <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                </div>
                <ul className="space-y-8 text-xl font-bold text-gray-900 px-6 w-full">
                   <li><a className="block hover:text-gray-500 py-2 px-4 w-full" href="/">Home</a></li>
                   <li><a className="block hover:text-gray-500 py-2 px-4 w-full" href="/blog">Blog</a></li>
                   <li><a className="block hover:text-gray-500 py-2 px-4 w-full" href="/about">About</a></li>
               </ul>
            </div>
            {/* 通常のメニュー: sm以上で表示 */}
            <ul className="hidden sm:flex sm:space-x-16 text-gray-900 font-bold items-center">
                <li>
                    <a className="hover:text-gray-500" href="/">Home</a>
                </li>
                <li>
                    <a className="hover:text-gray-500" href="/blog">Blog</a>
                </li>
                <li>
                    <a className="hover:text-gray-500" href="/about">About</a>
                </li>
            </ul>
        </header>
    );
}
