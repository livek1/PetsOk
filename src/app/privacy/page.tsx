import { Metadata } from 'next';
import LegalPageClient from '@/components/LegalPageClient';
import { legalContentRu } from '@/config/legalContent'; // ИЗМЕНЕНО ЗДЕСЬ

export const metadata: Metadata = {
    title: 'Политика конфиденциальности | PetsOk',
    robots: { index: false, follow: false }
};

export default function PrivacyPolicyPage() {
    return <LegalPageClient data={legalContentRu.privacy} />;
}