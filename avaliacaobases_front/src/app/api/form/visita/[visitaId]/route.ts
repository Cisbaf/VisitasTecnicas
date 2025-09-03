import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL;

async function proxyFetch(path: string, init?: RequestInit) {
    try {
        const res = await fetch(`${BACKEND}${path}`, init);
        const status = res.status;
        const contentType = res.headers.get("content-type") || "";

        if (status === 204) return new NextResponse(null, { status });

        const contentLength = res.headers.get("content-length");
        if (contentLength === "0") {
            return new NextResponse(null, { status });
        }

        const bodyText = await res.text();

        if (!bodyText.trim()) {
            return new NextResponse(null, { status });
        }

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

        const path = `/form/visita/${encodeURIComponent(visitaId)}`;

        return await proxyFetch(path, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/relatorios/consolidado/[idBase] GET proxy error:", err);
        return NextResponse.json({ message: "Erro interno", detail: String(err) }, { status: 500 });
    }
}