// app/logout/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        (async () => {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/user/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            router.push('/login');
        })();
    }, [router]);

    return <div>Saindo...</div>;
}
