// app/base/[baseId]/page.tsx
import { cookies } from 'next/headers';
import { decodeJwtPayload } from '@/lib/decodeJwt';
import { redirect } from 'next/navigation';
import BasesDashboard from '@/components/base/BasesDashboard';

export default async function BasePage() {

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const claims = decodeJwtPayload(token as string | undefined);
    const expired = claims && claims.exp * 1000 < Date.now();


    if (!claims || expired) {
        redirect('/login');
    }

    const isAllowed = claims.role === 'ADMIN' || (claims.role === 'FUNCIONARIO');
    if (!isAllowed) {
        redirect('/login');
    }

    return <BasesDashboard />
}
