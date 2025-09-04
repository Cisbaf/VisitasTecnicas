// app/base/[baseId]/page.tsx
import { cookies } from 'next/headers';
import { decodeJwtPayload } from '../../../lib/decodeJwt';
import { redirect } from 'next/navigation';
import AdminViatura from '@/components/admin/AdminViatura';


export default async function BasePage() {

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const claims = decodeJwtPayload(token as string | undefined);

    if (!claims) {
        redirect('/login');
    }

    const isAllowed = claims.role === 'ADMIN';
    if (!isAllowed) {
        redirect('/login');
    }

    return <AdminViatura />
}
