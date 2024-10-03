'use client';
import React from 'react';
import Header from '../modules/Header';
import Hero from '../modules/Hero';
import Footer from './Footer';
import GeneticCodes from './Labs/GeneticCodes/Base';

export default function Lab() {
    return (
        <main>
            <Header />
            <Hero />
            <div className="flex p-4 sm:p-10 flex-col sm:flex-row max-auto">
                <div className="w-full sm:w-3/4 markdown mb-16">
                    <div className="sm:px-10 markdown overflow-x-auto">
                        <GeneticCodes />
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    );
}
