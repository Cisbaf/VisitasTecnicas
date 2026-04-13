import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
    matcher: ['/admin/:path*', '/base/:path*', '/api/viatura/:path*']
};

function decodeJwtPayload(token?: string) {
    if (!token) return null;
    try {
        const parts = token.split('.');
        if (parts.length < 2) return null;
        const payload = parts[1];
        const b64 = payload.replace(/-/g, '+').replace(/_/g, '/');
        const json = typeof atob === 'function'
            ? atob(b64)
            : Buffer.from(b64, 'base64').toString('utf8');
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function middleware(req: NextRequest) {
    const url = req.nextUrl.clone();
    const token = req.cookies.get('token')?.value;
    const claims = decodeJwtPayload(token);

    // 🔐 Proteção
    if (url.pathname.startsWith('/admin') || url.pathname.startsWith('/api/viatura')) {
        if (!claims || claims.role !== 'ADMIN') {

            if (url.pathname.startsWith('/api/')) {
                return NextResponse.json({ message: "Forbidden" }, { status: 403 });
            }

            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}