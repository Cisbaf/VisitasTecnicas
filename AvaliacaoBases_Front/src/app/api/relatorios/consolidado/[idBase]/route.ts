import { NextResponse } from "next/server";
import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ idBase: string }> }
) {
    try {
        const { idBase } = await params;
        const url = new URL(req.url);
        const inicio = url.searchParams.get("inicio");
        const fim = url.searchParams.get("fim");

        if (!inicio || !fim) {
            return NextResponse.json(
                { message: "Parâmetros 'inicio' e 'fim' são obrigatórios" },
                { status: 400 }
            );
        }

        return await proxyWithAuth(
            `/avaliacao/relatorios/consolidado/${encodeURIComponent(idBase)}?inicio=${encodeURIComponent(inicio)}&fim=${encodeURIComponent(fim)}`,
            { cache: "no-store" }
        );
    } catch (err) {
        console.error("api/relatorios/consolidado/[idBase] GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
