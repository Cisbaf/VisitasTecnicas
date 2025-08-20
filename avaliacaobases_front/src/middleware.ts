// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que queremos proteger (ajuste conforme necessário)
export const config = {
    matcher: ['/admin/:path*', '/base/:path*']
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

    if (url.pathname.startsWith('/admin')) {
        if (!claims || claims.role !== 'ADMIN') {
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
    }

    const baseMatch = url.pathname.match(/^\/base\/([^/]+)/);
    if (baseMatch) {
        const baseId = baseMatch[1];
        if (!claims || (claims.role !== 'ADMIN' && !(claims.role === 'FUNCIONARIO' && claims.base === baseId))) {
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}
