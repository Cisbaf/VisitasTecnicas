import { decodeJwtPayload } from "@/lib/decodeJwt";
import { redirect } from 'next/navigation';
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();

  const token = cookieStore.get('token')?.value;
  const claims = decodeJwtPayload(token as string | undefined);
  const expired = claims && claims.exp < Date.now();
  console.log('Claims:', claims);
  console.log('Expired:', expired);
  console.log('Token:', token);
  const allCookies = cookieStore.getAll();

  console.log('All Cookies:', allCookies);
  if (!token) {
    redirect('/login');
  }

  const isAllowed = claims && (claims.role === 'ADMIN' || claims.role === 'FUNCIONARIO') || !expired;

  if (!isAllowed) {
    redirect('/login');
  }
  if (claims && claims.role === 'FUNCIONARIO' && claims.base) {
    redirect(`/base/${claims.base}`);
  }
  if (claims && claims.role === 'ADMIN') {
    redirect('/admin');
  }


  return (
    <div className="flex items-center justify-center h-screen">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mb-4"></div>
        <span className="text-lg text-gray-600">Redirecionando...</span>
      </div>
    </div>
  );
}
