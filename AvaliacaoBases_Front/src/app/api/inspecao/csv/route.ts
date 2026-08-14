import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const { searchParams } = new URL(req.url);

        const file = formData.get("file") as File;
        if (!file) {
            return NextResponse.json({ message: "Por favor, selecione um arquivo." }, { status: 400 });
        }

        const dataVigencia = formData.get("dataVigencia") || searchParams.get("dataVigencia");
        const query = dataVigencia ? `?dataVigencia=${encodeURIComponent(String(dataVigencia))}` : "";

        const backendFormData = new FormData();
        backendFormData.append("file", file);

        return await proxyWithAuth(`/avaliacao/inspecao/csv${query}`, {
            method: "POST",
            body: backendFormData,
        });
    } catch (err) {
        console.error("api/inspecao/csv POST proxy error:", err);
        return internalErrorResponse(err);
    }
}
