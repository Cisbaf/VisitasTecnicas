import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import LoginForm from './LoginForm';
import { decodeJwtPayload } from '@/lib/decodeJwt';

export default async function LoginPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    const claims = decodeJwtPayload(token as string | undefined);
    const expired = claims && claims.exp * 1000 < Date.now();

    if (token && !expired) {
        redirect('/');
    }
    return (
        <LoginForm />
    );
}

