"use client";
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import Image from 'next/image';

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <header className="site-header top-0 flex justify-between items-center px-4 sm:px-20 py-4 shadow-md w-full">
            {/* ハンバーガーメニュー(クローズ時) */}
            <div className={`w-full ${isMenuOpen ? 'hidden' : 'flex'} justify-between items-center`}>
                <div className="logo">
                    <a className="text-2xl text-[var(--site-ink)] font-bold color-black" href="/">
                        <div className="flex items-center">
                            <div className="relative w-12 h-12 mr-2">
                                <Image
                                    src="/images/logo-transparent.png"
                                    alt="logo"
                                    fill
                                    sizes="100% 100%"
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                            <h1>くろねこ。の実験室</h1>
                        </div>
                    </a>
                </div>
                {/* ハンバーガーメニューのアイコンをsm未満では出す */}
                <div className="site-menu-toggle flex sm:hidden items-center px-4">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"} aria-expanded={isMenuOpen} className="text-[var(--site-ink)]">
                        <FontAwesomeIcon icon={isMenuOpen ? faXmark : faBars} />
                    </button>
                </div>
            </div>
            {/* ハンバーガーメニュー(オープン時) */}
            <div className={`${isMenuOpen ? 'flex' : 'hidden'} sm:hidden fixed inset-0 site-menu flex-col justify-start items-center z-50`}>
                <div className="w-full flex justify-between items-center py-6 px-4">
                    <div className="logo">
                        <a className="text-2xl text-[var(--site-ink)] font-bold color-black" href="/">
                        <div className="flex items-center">
                            <div className="relative w-12 h-12 mr-2">
                                <Image
                                    src="/images/logo-transparent.png"
                                    alt="logo"
                                    fill
                                    sizes="100% 100%"
                                    style={{ objectFit: 'cover' }}
                                />
                            </div>
                            <h1>くろねこ。の実験室</h1>
                        </div>
                        </a>
                    </div>
                    {/* ハンバーガーメニューのアイコンをsm未満では出す */}
                    <div className="site-menu-toggle flex sm:hidden items-center px-4">
                        <button onClick={() => setIsMenuOpen(false)} aria-label="メニューを閉じる" className="text-[var(--site-ink)]">
                           <FontAwesomeIcon icon={faXmark} />
                        </button>
                    </div>
                </div>
                <ul className="space-y-8 text-xl font-bold text-[var(--site-ink)] px-6 w-full">
                   <li><a className="block hover:text-[var(--site-muted)] py-2 px-4 w-full" href="/">Home</a></li>
                   <li><a className="block hover:text-[var(--site-muted)] py-2 px-4 w-full" href="/blog">Blog</a></li>
                   <li><a className="block hover:text-[var(--site-muted)] py-2 px-4 w-full" href="/notes">Notes</a></li>
                   <li><a className="block hover:text-[var(--site-muted)] py-2 px-4 w-full" href="/about">About</a></li>
                   <li><a className="block hover:text-[var(--site-muted)] py-2 px-4 w-full" href="/lab">Lab</a></li>
               </ul>
            </div>
            {/* 通常のメニュー: sm以上で表示 */}
            <ul className="site-desktop-nav hidden sm:flex sm:space-x-6 text-[var(--site-ink)] font-bold items-center whitespace-nowrap">
                <li>
                    <a className="hover:text-[var(--site-muted)]" href="/">Home</a>
                </li>
                <li>
                    <a className="hover:text-[var(--site-muted)]" href="/blog">Blog</a>
                </li>
                <li><a className="hover:text-[var(--site-muted)]" href="/notes">Notes</a></li>
                <li>
                    <a className="hover:text-[var(--site-muted)]" href="/about">About</a>
                </li>
                <li>
                    <a className="hover:text-[var(--site-muted)]" href="/lab">Lab</a>
                </li>
            </ul>
        </header>
    );
}
