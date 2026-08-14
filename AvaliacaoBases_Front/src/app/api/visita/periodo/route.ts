import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const dataInicio = url.searchParams.get("dataInicio");
        const dataFim = url.searchParams.get("dataFim");
        const baseId = url.searchParams.get("baseId");

        if (!dataInicio || !dataFim) {
            return NextResponse.json({ message: "Parâmetros dataInicio e dataFim são obrigatórios" }, { status: 400 });
        }

        let path = `/avaliacao/visitas/periodo?dataInicio=${encodeURIComponent(dataInicio)}&dataFim=${encodeURIComponent(dataFim)}`;

        if (baseId) {
            path = `/avaliacao/visitas/periodo/${encodeURIComponent(baseId)}?dataInicio=${encodeURIComponent(dataInicio)}&dataFim=${encodeURIComponent(dataFim)}`;
        }

        return await proxyWithAuth(path, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/visita/periodo GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
