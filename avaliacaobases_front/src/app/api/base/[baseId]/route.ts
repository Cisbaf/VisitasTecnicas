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

export async function GET(req: Request, { params }: { params: Promise<{ baseId: string }> }) {
    try {
        const { baseId } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const path = `/avaliacao/bases/${encodeURIComponent(baseId)}`;

        return await proxyFetch(path, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/base/[baseId] GET proxy error:", err);
        return NextResponse.json({ message: "Erro interno", detail: String(err) }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ baseId: string }> }) {
    try {
        const { baseId } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const bodyText = await req.text();
        return await proxyFetch(`/avaliacao/bases/${encodeURIComponent(baseId)}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": req.headers.get("content-type") ?? "application/json",
            },
            body: bodyText,
        });
    } catch (err) {
        console.error("api/base/[id] PUT proxy error:", err);
        return NextResponse.json({ message: "Erro interno", detail: String(err) }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    context: { params: Promise<{ baseId: string }> }
) {
    try {
        const { baseId } = await context.params;
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });


        return await proxyFetch(`/avaliacao/bases/${encodeURIComponent(baseId)}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (err) {
        console.error("api/base/[id] DELETE proxy error:", err);
        return NextResponse.json({ message: "Erro interno", detail: String(err) }, { status: 500 });
    }
}
