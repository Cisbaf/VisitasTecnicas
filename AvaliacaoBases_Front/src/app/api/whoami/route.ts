// app/api/whoami/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decodeJwtPayload } from '../../../lib/decodeJwt';

export async function GET() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) return NextResponse.json({ ok: false, error: 'No token' }, { status: 401 });

    const claims = decodeJwtPayload(token);
    if (!claims) return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 });

    // Remova campos sensíveis se houver; aqui retornamos só os claims

    console.log('Claims:', claims);
    return NextResponse.json({ ok: true, claims });
}
