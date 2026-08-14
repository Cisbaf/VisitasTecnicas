import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: Promise<{ idBase: string }> }) {
    try {
        const { idBase } = await params;
        const url = new URL(req.url);
        const dataInicio = url.searchParams.get("dataInicio");
        const dataFim = url.searchParams.get("dataFim");

        if (!dataInicio || !dataFim) {
            return NextResponse.json({ message: "Parâmetros dataInicio e dataFim são obrigatórios" }, { status: 400 });
        }

        const path = `/avaliacao/visitas/periodo/${encodeURIComponent(idBase)}?dataInicio=${encodeURIComponent(dataInicio)}&dataFim=${encodeURIComponent(dataFim)}`;

        return await proxyWithAuth(path, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/visita/periodo/[idBase] GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
