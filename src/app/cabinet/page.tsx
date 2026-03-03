'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export default function CabinetIndex() {
    const router = useRouter();
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        if (user?.isSitter) {
            router.replace("/cabinet/sitter-dashboard");
        } else {
            router.replace("/cabinet/profile");
        }
    }, [user, router]);

    return null;
}