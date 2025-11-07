// app/api/forms/route.ts
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

// app/api/form/answers/all/route.ts
export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const visitIds = await req.json();

        // Envolva os visitIds em um objeto para o backend Spring
        const requestBody = Array.isArray(visitIds) ? { visitIds } : visitIds;

        const backendResponse = await proxyFetch(`/avaliacao/answers/all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });

        if (!backendResponse.ok) {
            const errorText = await backendResponse.text();
            console.error('Backend error:', errorText);
            throw new Error(`Backend responded with status: ${backendResponse.status}`);
        }

        const data = await backendResponse.json();
        return NextResponse.json(data);

    } catch (err) {
        console.error("api/form/answers/all POST proxy error:", err);
        return NextResponse.json({ message: "Internal error", detail: String(err) }, { status: 500 });
    }
}