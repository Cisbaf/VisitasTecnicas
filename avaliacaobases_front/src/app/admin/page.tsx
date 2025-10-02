// app/admin/page.tsx
import { cookies } from 'next/headers';
import { decodeJwtPayload } from '../../lib/decodeJwt';
import { redirect } from 'next/navigation';
import AdminHome from '@/components/admin/dashboard/AdminHome';
export default async function AdminPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const claims = decodeJwtPayload(token as string | undefined);

    if (!claims || claims.role !== 'ADMIN') {
        redirect('/login');
    }

    // Exemplo: buscar dados do backend passando Authorization (server-side fetch)
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const r = await fetch(`${backendUrl}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
    });
    const data = r.ok ? await r.json() : null;

    return (
        <>
            <AdminHome />
        </>
    );
}
