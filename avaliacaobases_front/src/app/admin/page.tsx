// app/admin/page.tsx
import { cookies } from 'next/headers';
import { decodeJwtPayload } from '../../lib/decodeJwt';
import { redirect } from 'next/navigation';
import AdminHome from '@/components/admin/dashboard/AdminHome';
export default async function AdminPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const claims = decodeJwtPayload(token as string | undefined);
    const expired = claims && claims.exp * 1000 < Date.now();


    if (!claims || claims.role !== 'ADMIN' || expired) {
        redirect('/login');
    }

    return (
        <>
            <AdminHome />
        </>
    );
}
