// app/api/answers/form/[formId]/route.ts 
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND = process.env.BACKEND_INTERNAL_URL;

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

export async function GET(req: Request, { params }: { params: Promise<{ formId: string }> }) {
    try {

        const { formId } = await params;
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        return await proxyFetch(`/avaliacao/answers/form/${encodeURIComponent(formId)}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/answers/form/[formId] GET proxy error:", err);
        return NextResponse.json({ message: "Erro interno", detail: String(err) }, { status: 500 });
    }
}