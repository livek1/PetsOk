// --- File: src/app/search/page.tsx ---
import { Metadata } from 'next';

import { Suspense } from 'react';
import SeoSearchClient from '../[city]/[service]/SeoSearchClient';

// Закрываем системный поиск от индексации ботами. 
// Боты должны индексировать только красивые ссылки (например, /moscow/pet-boarding)
export const metadata: Metadata = {
    title: 'Поиск специалистов | PetsOk',
    robots: {
        index: false,
        follow: false
    }
};

export default function GeneralSearchPage() {
    return (
        <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '100px 0' }}>Загрузка поиска...</div>}>
            <SeoSearchClient
                isGeneralSearch={true}
            />
        </Suspense>
    );
}