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


export async function DELETE(req: Request, { params }: { params: Promise<{ relatoId: string }> }) {
    try {
        const { relatoId } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const bodyText = await req.text();
        return await proxyFetch(`/avaliacao/relatos/${encodeURIComponent(relatoId)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": req.headers.get("content-type") ?? "application/json" },
            body: bodyText,
        });
    } catch (err) {
        console.error("api/visita/relatos/[relatoId] DELETE proxy error:", err);
        return NextResponse.json({ message: "Erro interno", detail: String(err) }, { status: 500 });
    }
}
export async function PUT(req: Request, { params }: { params: Promise<{ relatoId: string }> }) {
    try {
        const { relatoId } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const bodyText = await req.text();
        return await proxyFetch(`/avaliacao/relatos/${encodeURIComponent(relatoId)}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": req.headers.get("content-type") ?? "application/json" },
            body: bodyText,
        });
    } catch (err) {
        console.error("api/avaliacao/relatos/[relatoId] PUT proxy error:", err);
        return NextResponse.json({ message: "Erro interno", detail: String(err) }, { status: 500 });
    }
}