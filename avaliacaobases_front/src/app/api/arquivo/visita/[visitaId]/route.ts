// app/api/viatura/[id]/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

async function proxyFetch(path: string, init?: RequestInit) {
    try {
        const res = await fetch(`${BACKEND}${path}`, init);
        const status = res.status;
        const contentType = res.headers.get("content-type") || "";

        if (status === 204) return new NextResponse(null, { status });

        const bodyText = await res.text();
        return new NextResponse(bodyText, {
            status,
            headers: { "content-type": contentType },
        });
    } catch (err: any) {
        console.error("proxyFetch network error:", err);
        return NextResponse.json({ message: "Bad gateway", detail: err?.message ?? String(err) }, { status: 502 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ visitaId: string }> }) {
    try {

        const { visitaId } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        return await proxyFetch(`/avaliacao/midias/visita/${encodeURIComponent(visitaId)}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/viatura/[id] GET proxy error:", err);
        return NextResponse.json({ message: "Erro interno", detail: String(err) }, { status: 500 });
    }
}