'use client';

import React, { useState } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { AuthModal } from '@/components/modals/AuthModal';
import style from '@/style/pages/LegalPage.module.scss';

export default function LegalPageClient({ data }: { data: any }) {
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

    const handleAuthClick = (mode: 'login' | 'register') => {
        setAuthMode(mode);
        setAuthModalOpen(true);
    };

    if (!data) return null;

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header onAuthClick={handleAuthClick} />

            <main style={{ flexGrow: 1, paddingTop: '90px' }}>
                <div className={style.legalPageContainer}>
                    <h1>{data.title}</h1>
                    {data.updateDate && <p className={style.updateDate}>{data.updateDate}</p>}

                    <div className={style.legalPageContent}>
                        {data.content?.map((block: any, i: number) => {
                            if (block.type === 'h2') return <h2 key={i} dangerouslySetInnerHTML={{ __html: block.text }} />;
                            if (block.type === 'h3') return <h3 key={i} dangerouslySetInnerHTML={{ __html: block.text }} />;
                            if (block.type === 'p') return <p key={i} dangerouslySetInnerHTML={{ __html: block.text }} />;
                            if (block.type === 'ul') return (
                                <ul key={i} className={style.list}>
                                    {block.items.map((item: string, j: number) => (
                                        <li key={j} dangerouslySetInnerHTML={{ __html: item }} />
                                    ))}
                                </ul>
                            );
                            return null;
                        })}
                    </div>
                </div>
            </main>

            <Footer />

            <AuthModal
                isOpen={authModalOpen}
                onClose={() => setAuthModalOpen(false)}
                initialMode={authMode}
            />
        </div>
    );
}