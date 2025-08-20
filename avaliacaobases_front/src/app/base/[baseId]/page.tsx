// app/base/[baseId]/page.tsx
import { cookies } from 'next/headers';
import { decodeJwtPayload } from '../../../lib/decodeJwt';
import { redirect } from 'next/navigation';

interface Props { params: { baseId: string } }

export default async function BasePage({ params }: Props) {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value; const claims = decodeJwtPayload(token as string | undefined);

    if (!claims) {
        redirect('/login');
    }

    const isAllowed = claims.role === 'ADMIN' || (claims.role === 'FUNCIONARIO' && claims.base === params.baseId);
    if (!isAllowed) {
        redirect('/login');
    }

    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const r = await fetch(`${backendUrl}/base/${params.baseId}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store'
    });
    const data = r.ok ? await r.json() : null;

    return (
        <main style={{ padding: 24 }}>
            <h1>Painel da Base {params.baseId}</h1>
            <p>Usuário: {claims.sub} — Cargo: {claims.role}</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </main>
    );
}
