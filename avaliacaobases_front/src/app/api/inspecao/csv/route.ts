// app/api/inspecao/csv/route.ts
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

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // Obter o FormData da requisição
        const formData = await req.formData();

        // Verificar se existe o arquivo no FormData
        const file = formData.get("file") as File;
        if (!file) {
            return NextResponse.json({ message: "Por favor, selecione um arquivo." }, { status: 400 });
        }


        // Criar um novo FormData para enviar ao backend
        const backendFormData = new FormData();
        backendFormData.append("file", file);

        return await proxyFetch(`/avaliacao/inspecao/csv`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                // Não definir Content-Type - o browser vai definir com o boundary correto
            },
            body: backendFormData,
        });
    } catch (err) {
        console.error("api/inspecao/csv POST proxy error:", err);
        return NextResponse.json({ message: "Erro interno", detail: String(err) }, { status: 500 });
    }
}