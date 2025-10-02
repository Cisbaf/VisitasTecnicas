// app/api/forms/route.ts
import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const campoId = searchParams.get('campoId');
        const visitaId = searchParams.get('visitaId');

        if (!campoId || !visitaId) {
            return NextResponse.json({ message: "campoId and visitaId are required" }, { status: 400 });
        }

        // Construa a URL do backend com os parâmetros
        const backendUrl = `/form/answers?campoId=${campoId}&visitId=${visitaId}`;

        return await proxyFetch(backendUrl, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/form/answers GET proxy error:", err);
        return NextResponse.json({ message: "Internal error", detail: String(err) }, { status: 500 });
    }
}


