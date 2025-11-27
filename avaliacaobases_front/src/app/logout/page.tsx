// app/logout/page.tsx
'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        (async () => {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/avaliacao/user/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            router.push('/login');
        })();
    }, [router]);

    return (
        <div className="flex items-center justify-center h-screen">
            <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-4"></div>
                <span className="text-lg text-gray-600">Saindo...</span>
            </div>
        </div>
    );
}
