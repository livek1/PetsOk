import { Metadata } from 'next';
import LegalPageClient from '@/components/LegalPageClient';
import { legalContentRu } from '@/config/legalContent'; // ИЗМЕНЕНО ЗДЕСЬ

export const metadata: Metadata = {
    title: 'Условия использования | PetsOk',
    robots: { index: false, follow: false }
};

export default function TermsPage() {
    return <LegalPageClient data={legalContentRu.terms} />;
}