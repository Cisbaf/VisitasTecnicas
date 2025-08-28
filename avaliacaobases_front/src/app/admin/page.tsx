// app/admin/page.tsx
import { cookies } from 'next/headers';
import { decodeJwtPayload } from '../../lib/decodeJwt';
import { redirect } from 'next/navigation';

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
        <main style={{ padding: 24 }}>
            <h1>Painel Admin</h1>
            <p>Usuário: {claims.sub}</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </main>
    );
}
