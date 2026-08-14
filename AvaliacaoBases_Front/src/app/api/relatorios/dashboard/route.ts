import { NextResponse } from "next/server";
import { internalErrorResponse, proxyWithAuth } from "@/lib/apiProxy";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const inicio = url.searchParams.get("inicio");
        const fim = url.searchParams.get("fim");
        const baseId = url.searchParams.get("baseId");

        if (!inicio || !fim) {
            return NextResponse.json(
                { message: "Parâmetros 'inicio' e 'fim' são obrigatórios" },
                { status: 400 }
            );
        }

        const params = new URLSearchParams({ inicio, fim });
        if (baseId) {
            params.set("baseId", baseId);
        }

        return await proxyWithAuth(`/avaliacao/relatorios/dashboard?${params.toString()}`, {
            cache: "no-store",
        });
    } catch (err) {
        console.error("api/relatorios/dashboard GET proxy error:", err);
        return internalErrorResponse(err);
    }
}
